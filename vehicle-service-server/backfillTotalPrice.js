const { SparePartRequest, SparePart } = require('../vehicle-service-server/model');

async function backfillTotalPrice() {
  try {
    const requests = await SparePartRequest.findAll();
    for (const request of requests) {
      const sparePart = await SparePart.findByPk(request.sparePartId);
      if (sparePart && sparePart.price != null) {
        request.totalPrice = (sparePart.price * request.quantity).toFixed(2);
        await request.save();
        console.log(`Updated request ${request.id} with totalPrice: ${request.totalPrice}`);
      } else {
        console.warn(`No price found for spare part ${request.sparePartId} in request ${request.id}`);
      }
    }
    console.log('Backfill completed');
  } catch (error) {
    console.error('Error backfilling totalPrice:', error);
  }
}

backfillTotalPrice();