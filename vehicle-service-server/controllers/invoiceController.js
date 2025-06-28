const { Invoice, Service, Vehicle, User, SparePartRequest,SparePart } = require('../model');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

class InvoiceController {
  // Create a new invoice

static async createInvoice(req, res) {
  const { serviceId, vehicleId, userId, laborCost, tax, totalAmount, status } = req.body;
  let { items } = req.body;

  try {
    // Basic validation
    if (!serviceId || !vehicleId || !userId || isNaN(laborCost) || isNaN(tax) || isNaN(totalAmount)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Check service
    const service = await Service.findByPk(serviceId);
    if (!service || service.status !== 'Completed') {
      return res.status(400).json({ message: 'Service not found or not completed' });
    }

    // Check vehicle and user
    const [vehicle, user] = await Promise.all([
      Vehicle.findByPk(vehicleId),
      User.findByPk(userId),
    ]);
    if (!vehicle || !user) {
      return res.status(400).json({ message: 'Vehicle or user not found' });
    }

    // Fetch approved spare part requests for the service
    const approvedParts = await SparePartRequest.findAll({
      where: {
        serviceId,
        status: 'Approved',
      },
      include: [{ model: SparePart, as: 'sparePart', attributes: ['name', 'price'] }],
    });

    // Auto-generate items from approved spare parts if not provided
    if (!items || !Array.isArray(items)) {
      items = approvedParts.map((part) => ({
        description: part.sparePart.name,
        quantity: part.quantity,
        unitPrice: parseFloat(part.sparePart.price),
        total: parseFloat(part.totalPrice),
      }));
    }

    // Validate parts cost
    const partsCostFromItems = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      return sum + itemTotal;
    }, 0);

    const partsCost = approvedParts.reduce((sum, part) => sum + parseFloat(part.totalPrice), 0);
    if (partsCostFromItems !== partsCost) {
      return res.status(400).json({ message: 'Parts cost mismatch' });
    }

    // Create invoice
    const invoice = await Invoice.create({
      serviceId,
      vehicleId,
      userId,
      items,
      laborCost: parseFloat(laborCost),
      partsCost: parseFloat(partsCost),
      tax: parseFloat(tax),
      totalAmount: parseFloat(totalAmount),
      status,
      sentAt: status === 'Sent' ? new Date() : null,
    });

    // Link invoice to service
    await Service.update({ invoiceId: invoice.id }, { where: { id: serviceId } });

    return res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ message: 'Failed to create invoice' });
  }
}

  // Get invoices by serviceId or all (admin/client)
  static async getInvoices(req, res) {
    const { serviceId } = req.query;
    const userId = req.userId;
    const userRole = req.user.role;

    try {
      const include = [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'description', 'status', 'date'],
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'year', 'plate'],
          ...(userRole !== 'admin' && {
            where: { userId },
          }),
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ];

      const where = {};
      if (serviceId) {
        where.serviceId = serviceId;
      }

      const invoices = await Invoice.findAll({
        where,
        include,
        order: [['createdAt', 'DESC']],
      });

      return res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      if (!['Draft', 'Sent', 'Paid', 'Overdue'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const updateData = { status };
      if (status === 'Sent' && !invoice.sentAt) {
        updateData.sentAt = new Date();
      }

      await invoice.update(updateData);

      return res.json(invoice);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return res.status(500).json({ message: 'Failed to update invoice' });
    }
  }

  // Delete invoice (drafts only)
  static async deleteInvoice(req, res) {
    const { id } = req.params;

    try {
      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      if (invoice.status !== 'Draft') {
        return res.status(400).json({ message: 'Only draft invoices can be deleted' });
      }

      await Service.update({ invoiceId: null }, { where: { invoiceId: id } });
      await invoice.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return res.status(500).json({ message: 'Failed to delete invoice' });
    }
  }
// Send invoice email
static async sendInvoiceEmail(req, res) {
  const { id } = req.params;

  try {
    // Validate environment config
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: 'Email configuration is missing' });
    }

    // Get invoice and associated data
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Service, as: 'service', attributes: ['id', 'description', 'status', 'date', 'mechanicId'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'year', 'plate', 'userId'] },
        { model: User, as: 'user', attributes: ['id'] }, // No email or username here to avoid sensitive logs
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get the vehicle owner's email
    const vehicle = await Vehicle.findByPk(invoice.vehicleId, {
      include: [{ association: 'owner', attributes: ['email', 'role'] }],
    });

    if (!vehicle || !vehicle.owner?.email) {
      return res.status(400).json({ message: 'Vehicle owner email not found' });
    }

    if (vehicle.owner.role === 'mechanic') {
      return res.status(400).json({ message: 'Invalid vehicle owner' });
    }

    const recipientEmail = vehicle.owner.email;

    if (!invoice.vehicle || !invoice.service || !invoice.items) {
      return res.status(400).json({ message: 'Incomplete invoice data' });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    // Generate invoice items HTML
    const itemsList = invoice.items.map((item) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${item.description}</td>
        <td style="padding:8px;border:1px solid #ddd;">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;">KES ${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #ddd;">KES ${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Invoice #${invoice.id.slice(0, 8)}</h2>
        <p><strong>Vehicle:</strong> ${invoice.vehicle.make} ${invoice.vehicle.model} (${invoice.vehicle.plate})</p>
        <p><strong>Service:</strong> ${invoice.service.description} (${new Date(invoice.service.date).toLocaleDateString()})</p>
        <h3>Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding:8px;border:1px solid #ddd;">Description</th>
              <th style="padding:8px;border:1px solid #ddd;">Quantity</th>
              <th style="padding:8px;border:1px solid #ddd;">Unit Price</th>
              <th style="padding:8px;border:1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        <p><strong>Labor Cost:</strong> KES ${parseFloat(invoice.laborCost).toFixed(2)}</p>
        <p><strong>Parts Cost:</strong> KES ${parseFloat(invoice.partsCost).toFixed(2)}</p>
        <p><strong>Tax:</strong> KES ${parseFloat(invoice.tax).toFixed(2)}</p>
        <p><strong>Total Amount:</strong> KES ${parseFloat(invoice.totalAmount).toFixed(2)}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p style="margin-top: 20px;">Thank you for your business.</p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"AutoService" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Invoice #${invoice.id.slice(0, 8)} for ${invoice.vehicle.make} ${invoice.vehicle.model}`,
      html: emailContent,
    });

    // Update invoice status
    await invoice.update({ status: 'Sent', sentAt: new Date() });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Invoice email error:', error.message);
    return res.status(500).json({ message: 'Failed to send invoice email' });
  }
}
}

module.exports = InvoiceController;
