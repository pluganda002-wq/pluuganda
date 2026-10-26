import { getDb, isDbConfigured } from "./lib/mongodb.js";
import { isMomoConfigured, requestToPay } from "./lib/momo.js";
import { fareFromKm, haversineKm, pathDistanceKm, TUGENDE_RATE_UGX_PER_KM } from "./lib/tugendeMath.js";

const DEMO_DRIVER_ID = 900001;

async function getUser(db, telegramId) {
  return db.collection("tugende_users").findOne({ telegramId: String(telegramId) });
}

async function ensureUser(db, telegramId, patch = {}) {
  const id = String(telegramId);
  const existing = await db.collection("tugende_users").findOne({ telegramId: id });
  if (existing) {
    if (Object.keys(patch).length) {
      await db.collection("tugende_users").updateOne({ telegramId: id }, { $set: { ...patch, updatedAt: new Date() } });
      return db.collection("tugende_users").findOne({ telegramId: id });
    }
    return existing;
  }
  const doc = {
    telegramId: id,
    fullName: patch.fullName ?? "Patriot",
    phone: patch.phone ?? "",
    role: patch.role ?? "rider",
    walletBalanceUgx: 0,
    location: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection("tugende_users").insertOne(doc);
  return doc;
}

function serializeUser(u) {
  if (!u) return null;
  return {
    telegramId: u.telegramId,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    walletBalanceUgx: u.walletBalanceUgx ?? 0,
    location: u.location,
  };
}

function serializeRide(r) {
  if (!r) return null;
  return {
    rideId: r.rideId,
    status: r.status,
    riderId: r.riderId,
    driverId: r.driverId,
    pickup: r.pickup,
    dropoff: r.dropoff,
    distanceKm: r.distanceKm ?? 0,
    fareUgx: r.fareUgx ?? 0,
    path: r.path ?? [],
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    startedAt: r.startedAt?.toISOString?.() ?? r.startedAt,
    endedAt: r.endedAt?.toISOString?.() ?? r.endedAt,
  };
}

export async function GET(request) {
  if (!isDbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const telegramId = url.searchParams.get("telegramId");

  if (action === "walletConfig") {
    return Response.json({ momoEnabled: isMomoConfigured() });
  }

  if (!telegramId) {
    return Response.json({ error: "telegramId required" }, { status: 400 });
  }

  const db = await getDb();

  if (action === "profile") {
    const user = await getUser(db, telegramId);
    return Response.json({ user: serializeUser(user), rateUgxPerKm: TUGENDE_RATE_UGX_PER_KM });
  }

  if (action === "activeRide") {
    const ride = await db.collection("tugende_rides").findOne({
      $or: [{ riderId: String(telegramId) }, { driverId: String(telegramId) }],
      status: { $in: ["pending", "accepted", "in_progress"] },
    });
    return Response.json({ ride: serializeRide(ride) });
  }

  if (action === "pendingRides") {
    const rides = await db
      .collection("tugende_rides")
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    return Response.json({ rides: rides.map(serializeRide) });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(request) {
  if (!isDbConfigured()) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, telegramId } = body;
  if (!telegramId) {
    return Response.json({ error: "telegramId required" }, { status: 400 });
  }

  const db = await getDb();
  const tid = String(telegramId);

  switch (action) {
    case "login": {
      const user = await ensureUser(db, tid, {
        fullName: body.fullName?.trim() || "Patriot",
        phone: body.phone?.trim() || "",
        role: body.role === "driver" ? "driver" : "rider",
      });
      return Response.json({ user: serializeUser(user), rateUgxPerKm: TUGENDE_RATE_UGX_PER_KM });
    }

    case "updateLocation": {
      const { lat, lng } = body;
      if (typeof lat !== "number" || typeof lng !== "number") {
        return Response.json({ error: "lat and lng required" }, { status: 400 });
      }
      await ensureUser(db, tid);
      const location = { lat, lng, updatedAt: new Date() };
      await db.collection("tugende_users").updateOne({ telegramId: tid }, { $set: { location, updatedAt: new Date() } });

      const active = await db.collection("tugende_rides").findOne({
        $or: [{ riderId: tid }, { driverId: tid }],
        status: "in_progress",
      });
      if (active) {
        const path = [...(active.path ?? []), { lat, lng, at: new Date() }];
        const distanceKm = pathDistanceKm(path);
        const fareUgx = fareFromKm(distanceKm);
        await db.collection("tugende_rides").updateOne(
          { rideId: active.rideId },
          { $set: { path, distanceKm, fareUgx, updatedAt: new Date() } }
        );
      }
      return Response.json({ ok: true, location });
    }

    case "requestRide": {
      const user = await ensureUser(db, tid, { role: "rider" });
      const existing = await db.collection("tugende_rides").findOne({
        riderId: tid,
        status: { $in: ["pending", "accepted", "in_progress"] },
      });
      if (existing) {
        return Response.json({ ride: serializeRide(existing) });
      }
      const pickup = body.pickup;
      const dropoff = body.dropoff;
      if (!pickup?.lat || !dropoff?.lat) {
        return Response.json({ error: "pickup and dropoff coordinates required" }, { status: 400 });
      }
      const rideId = `TG-${Date.now().toString(36).toUpperCase()}`;
      const estKm = haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const ride = {
        rideId,
        riderId: tid,
        driverId: null,
        status: "pending",
        pickup,
        dropoff,
        path: [{ lat: pickup.lat, lng: pickup.lng }],
        distanceKm: 0,
        fareUgx: fareFromKm(estKm),
        estimatedKm: estKm,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const liveDriver = await db.collection("tugende_users").findOne({
        role: "driver",
        telegramId: { $ne: tid },
        "location.updatedAt": { $exists: true },
      });
      if (liveDriver) {
        ride.status = "pending";
      } else {
        await ensureUser(db, DEMO_DRIVER_ID, {
          fullName: "Tugende Safe Boda",
          role: "driver",
        });
        ride.status = "accepted";
        ride.driverId = String(DEMO_DRIVER_ID);
        ride.acceptedAt = new Date();
      }
      await db.collection("tugende_rides").insertOne(ride);

      return Response.json({ ride: serializeRide(ride) });
    }

    case "acceptRide": {
      const { rideId } = body;
      const user = await ensureUser(db, tid, { role: "driver" });
      const ride = await db.collection("tugende_rides").findOne({ rideId, status: "pending" });
      if (!ride) return Response.json({ error: "Ride not available" }, { status: 404 });
      await db.collection("tugende_rides").updateOne(
        { rideId },
        { $set: { status: "accepted", driverId: tid, acceptedAt: new Date(), updatedAt: new Date() } }
      );
      return Response.json({ ride: serializeRide(await db.collection("tugende_rides").findOne({ rideId })) });
    }

    case "startRide": {
      const { rideId } = body;
      const ride = await db.collection("tugende_rides").findOne({ rideId });
      if (!ride || !["accepted", "pending"].includes(ride.status)) {
        return Response.json({ error: "Cannot start ride" }, { status: 400 });
      }
      if (ride.riderId !== tid && ride.driverId !== tid && String(DEMO_DRIVER_ID) !== tid) {
        return Response.json({ error: "Not authorised" }, { status: 403 });
      }
      await db.collection("tugende_rides").updateOne(
        { rideId },
        { $set: { status: "in_progress", startedAt: new Date(), updatedAt: new Date() } }
      );
      return Response.json({ ride: serializeRide(await db.collection("tugende_rides").findOne({ rideId })) });
    }

    case "completeRide": {
      const { rideId } = body;
      const ride = await db.collection("tugende_rides").findOne({ rideId });
      if (!ride || ride.status !== "in_progress") {
        return Response.json({ error: "Ride not in progress" }, { status: 400 });
      }
      let path = ride.path ?? [];
      if (body.path?.length) path = body.path;
      let distanceKm = pathDistanceKm(path);
      if (distanceKm < 0.1 && ride.pickup && ride.dropoff) {
        distanceKm = haversineKm(ride.pickup.lat, ride.pickup.lng, ride.dropoff.lat, ride.dropoff.lng);
        path = [
          { lat: ride.pickup.lat, lng: ride.pickup.lng },
          { lat: ride.dropoff.lat, lng: ride.dropoff.lng },
        ];
      }
      const fareUgx = fareFromKm(distanceKm);
      const rider = await getUser(db, ride.riderId);
      if ((rider?.walletBalanceUgx ?? 0) < fareUgx) {
        return Response.json({ error: "Insufficient wallet balance. Top up to pay.", fareUgx }, { status: 402 });
      }
      await db.collection("tugende_users").updateOne(
        { telegramId: ride.riderId },
        { $inc: { walletBalanceUgx: -fareUgx }, $set: { updatedAt: new Date() } }
      );
      if (ride.driverId) {
        await db.collection("tugende_users").updateOne(
          { telegramId: String(ride.driverId) },
          { $inc: { walletBalanceUgx: fareUgx }, $set: { updatedAt: new Date() } }
        );
      }
      await db.collection("tugende_transactions").insertMany([
        {
          type: "ride_payment",
          telegramId: ride.riderId,
          rideId,
          amountUgx: -fareUgx,
          createdAt: new Date(),
        },
        {
          type: "ride_payout",
          telegramId: ride.driverId,
          rideId,
          amountUgx: fareUgx,
          createdAt: new Date(),
        },
      ]);
      await db.collection("tugende_rides").updateOne(
        { rideId },
        {
          $set: {
            status: "completed",
            path,
            distanceKm,
            fareUgx,
            endedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
      const updatedUser = await getUser(db, ride.riderId);
      return Response.json({
        ride: serializeRide(await db.collection("tugende_rides").findOne({ rideId })),
        walletBalanceUgx: updatedUser?.walletBalanceUgx ?? 0,
      });
    }

    case "cancelRide": {
      const { rideId } = body;
      await db.collection("tugende_rides").updateOne(
        { rideId, riderId: tid },
        { $set: { status: "cancelled", updatedAt: new Date(), endedAt: new Date() } }
      );
      return Response.json({ ok: true });
    }

    case "topUp": {
      const amountUgx = Math.round(Number(body.amountUgx));
      if (!amountUgx || amountUgx < 1000) {
        return Response.json({ error: "Minimum top-up UGX 1,000" }, { status: 400 });
      }
      const user = await ensureUser(db, tid);
      const externalId = `TG-TU-${tid}-${Date.now()}`;
      let payment = { mode: "demo", status: "completed", reference: externalId };

      if (isMomoConfigured()) {
        const phone = body.phone?.trim() || user.phone;
        if (!phone) {
          return Response.json({ error: "Add your mobile money number on your profile first." }, { status: 400 });
        }
        payment = await requestToPay({
          amountUgx,
          phone,
          externalId,
          payerMessage: "Tugende wallet top-up",
        });
        if (payment.status !== "completed") {
          return Response.json(
            { error: "Approve the MTN MoMo prompt on your phone, then try again.", payment },
            { status: 402 }
          );
        }
      }

      await db.collection("tugende_users").updateOne(
        { telegramId: tid },
        { $inc: { walletBalanceUgx: amountUgx }, $set: { updatedAt: new Date() } }
      );
      await db.collection("tugende_transactions").insertOne({
        type: "topup",
        telegramId: tid,
        amountUgx,
        payment,
        createdAt: new Date(),
      });
      const updated = await getUser(db, tid);
      return Response.json({ walletBalanceUgx: updated.walletBalanceUgx, payment });
    }

    case "withdraw": {
      const amountUgx = Math.round(Number(body.amountUgx));
      const phone = body.phone?.trim();
      if (!amountUgx || amountUgx < 5000) {
        return Response.json({ error: "Minimum withdrawal UGX 5,000" }, { status: 400 });
      }
      if (!phone) return Response.json({ error: "Mobile money phone required" }, { status: 400 });
      const user = await getUser(db, tid);
      if ((user?.walletBalanceUgx ?? 0) < amountUgx) {
        return Response.json({ error: "Insufficient balance" }, { status: 402 });
      }
      await db.collection("tugende_users").updateOne(
        { telegramId: tid },
        { $inc: { walletBalanceUgx: -amountUgx }, $set: { updatedAt: new Date() } }
      );
      await db.collection("tugende_transactions").insertOne({
        type: "withdraw",
        telegramId: tid,
        amountUgx: -amountUgx,
        phone,
        status: "pending",
        createdAt: new Date(),
      });
      const updated = await getUser(db, tid);
      return Response.json({ walletBalanceUgx: updated.walletBalanceUgx, status: "pending" });
    }

    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }
}
