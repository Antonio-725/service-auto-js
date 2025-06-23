const { Invoice, Service, Vehicle, User, SparePartRequest } = require('../model');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

class InvoiceController {
  // Create a new invoice
  static async createInvoice(req, res) {
    const {
      serviceId,
      vehicleId,
      userId,
      items,
      laborCost,
      partsCost,
      tax,
      totalAmount,
      status,
    } = req.body;

    try {
      // Basic validation
      if (
        !serviceId ||
        !vehicleId ||
        !userId ||
        !Array.isArray(items) ||
        isNaN(laborCost) ||
        isNaN(partsCost) ||
        isNaN(tax) ||
        isNaN(totalAmount)
      ) {
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

      // Validate items and parts cost
      const approvedParts = await SparePartRequest.findAll({
        where: {
          vehicleId,
          status: 'Approved',
          createdAt: { [Op.gte]: service.createdAt },
        },
      });

      const partsCostFromItems = items.reduce((sum, item) => {
        const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        return sum + itemTotal;
      }, 0);

      if (partsCostFromItems !== parseFloat(partsCost)) {
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

//   // Send invoice email


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

// static async sendInvoiceEmail(req, res) {
//   const { id } = req.params;
//   const recipientEmail = req.body?.recipientEmail || null;

//   console.log(`Processing email for invoice ${id} to ${recipientEmail || 'vehicle owner'}`);

//   try {
//     // Validate environment variables
//     if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       console.error('Missing email configuration:', {
//         host: process.env.EMAIL_HOST,
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS ? '[HIDDEN]' : undefined,
//       });
//       return res.status(500).json({ message: 'Email configuration is missing' });
//     }

//     // Find invoice with associated data
//     const invoice = await Invoice.findByPk(id, {
//       include: [
//         { model: Service, as: 'service', attributes: ['id', 'description', 'status', 'date', 'mechanicId'] },
//         { model: Vehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'year', 'plate', 'userId'] },
//         { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
//       ],
//     });

//     if (!invoice) {
//       console.log(`Invoice ${id} not found`);
//       return res.status(404).json({ message: 'Invoice not found' });
//     }

//     // Fetch vehicle owner's email, ignoring provided recipientEmail to ensure correctness
//     const vehicle = await Vehicle.findByPk(invoice.vehicleId, {
//       include: [
//         {
//           association: 'owner',
//           attributes: ['id', 'username', 'email', 'role'],
//         },
//       ],
//     });

//     if (!vehicle || !vehicle.owner?.email) {
//       console.log('Vehicle or owner email not found', { vehicleId: invoice.vehicleId });
//       return res.status(400).json({ message: 'Vehicle owner email not found' });
//     }

//     // Debugging: Log owner and invoice user details
//     console.log('Vehicle owner:', {
//       userId: vehicle.userId,
//       email: vehicle.owner.email,
//       role: vehicle.owner.role,
//     });
//     console.log('Invoice user:', {
//       userId: invoice.userId,
//       email: invoice.user?.email,
//       role: invoice.user?.role,
//     });

//     // Ensure owner is not a mechanic
//     if (vehicle.owner.role === 'mechanic') {
//       console.error('Vehicle owner is a mechanic, which is incorrect');
//       return res.status(400).json({ message: 'Invalid vehicle owner: User is a mechanic' });
//     }

//     const finalRecipientEmail = vehicle.owner.email;
//     console.log(`Sending email to vehicle owner: ${finalRecipientEmail}`);

//     if (!invoice.vehicle || !invoice.service || !invoice.items) {
//       console.log('Incomplete invoice data', {
//         hasVehicle: !!invoice.vehicle,
//         hasService: !!invoice.service,
//         hasItems: !!invoice.items,
//       });
//       return res.status(400).json({ message: 'Incomplete invoice data' });
//     }

//     // Configure email transporter for Gmail
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: parseInt(process.env.EMAIL_PORT || '587'),
//       secure: process.env.EMAIL_SECURE === 'true',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       logger: true,
//       debug: true,
//     });

//     // Verify SMTP connection
//     await transporter.verify();
//     console.log('Gmail SMTP connection verified');

//     // Generate email content
//     const itemsList = invoice.items
//       .map((item) => {
//         if (!item.quantity || !item.unitPrice) {
//           console.log('Invalid item data', item);
//           throw new Error('Invalid item data');
//         }
//         return `
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;">${item.description}</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">KES ${parseFloat(item.unitPrice).toFixed(2)}</td>
//             <td style="padding: 8px; border: 1px solid #ddd;">KES ${(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)}</td>
//           </tr>`;
//       })
//       .join('');

//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
//         <h2 style="color: #333;">Invoice #${invoice.id.slice(0, 8)}</h2>
//         <p><strong>Vehicle:</strong> ${invoice.vehicle.make} ${invoice.vehicle.model} (${invoice.vehicle.plate})</p>
//         <p><strong>Service:</strong> ${invoice.service.description} (${new Date(invoice.service.date).toLocaleDateString()})</p>
//         <h3 style="color: #333;">Items</h3>
//         <table style="width: 100%; border-collapse: collapse;">
//           <thead>
//             <tr style="background-color: #f2f2f2;">
//               <th style="padding: 8px; border: 1px solid #ddd;">Description</th>
//               <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
//               <th style="padding: 8px; border: 1px solid #ddd;">Unit Price</th>
//               <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemsList}
//           </tbody>
//         </table>
//         <p style="margin-top: 20px;"><strong>Labor Cost:</strong> KES ${parseFloat(invoice.laborCost).toFixed(2)}</p>
//         <p><strong>Parts Cost:</strong> KES ${parseFloat(invoice.partsCost).toFixed(2)}</p>
//         <p><strong>Tax:</strong> KES ${parseFloat(invoice.tax).toFixed(2)}</p>
//         <p style="font-size: 1.1em; color: #333;"><strong>Total Amount:</strong> KES ${parseFloat(invoice.totalAmount).toFixed(2)}</p>
//         <p><strong>Status:</strong> ${invoice.status}</p>
//         <p style="margin-top: 20px;">Please contact us for payment instructions.</p>
//         <p style="color: #777; font-size: 0.9em;">Sent by AutoService</p>
//       </div>
//     `;

//     // Send email
//     console.log(`Sending email to ${finalRecipientEmail}...`);
//     await transporter.sendMail({
//       from: `"AutoService" <${process.env.EMAIL_USER}>`,
//       to: finalRecipientEmail,
//       subject: `Invoice #${invoice.id.slice(0, 8)} for ${invoice.vehicle.make} ${invoice.vehicle.model}`,
//       html: emailContent,
//     });

//     // Update invoice status to Sent
//     await invoice.update({ status: 'Sent', sentAt: new Date() });

//     console.log('Email sent successfully');
//     return res.status(200).json({ message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Error sending invoice email:', error.message, error.stack);
//     return res.status(500).json({ message: `Failed to send invoice email: ${error.message}` });
//   }
// }
// }


module.exports = InvoiceController;
