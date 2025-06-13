//controllers/sparepartController
// const { SparePart } = require('../model');
// const fs = require('fs');
// const path = require('path');

// const getAllSpareParts = async (req, res) => {
//   try {
//     if (!SparePart) {
//       console.error('SparePart model is not defined');
//       return res.status(500).json({ message: 'Server error: SparePart model not found' });
//     }

//     const spareParts = await SparePart.findAll({
//       attributes: ['id', 'name', 'price', 'picture', 'quantity', 'criticalLevel', 'createdAt', 'updatedAt'],
//     });

//     return res.status(200).json(spareParts);
//   } catch (error) {
//     console.error('Error fetching spare parts:', error.stack);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const getSparePartById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     if (!SparePart) {
//       console.error('SparePart model is not defined');
//       return res.status(500).json({ message: 'Server error: SparePart model not found' });
//     }

//     const sparePart = await SparePart.findByPk(id, {
//       attributes: ['id', 'name', 'price', 'picture', 'quantity', 'criticalLevel', 'createdAt', 'updatedAt'],
//     });

//     if (!sparePart) {
//       return res.status(404).json({ message: 'Spare part not found' });
//     }

//     return res.status(200).json(sparePart);
//   } catch (error) {
//     console.error('Error fetching spare part:', error.stack);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const createSparePart = async (req, res) => {
//   const { name, price, picture, quantity, criticalLevel } = req.body;

//   try {
//     if (!SparePart) {
//       console.error('SparePart model is not defined');
//       return res.status(500).json({ message: 'Server error: SparePart model not found' });
//     }

//     // Validate input
//     if (!name || price == null || quantity == null) {
//       return res.status(400).json({ message: 'Name, price, and quantity are required' });
//     }

//     if (price < 0 || quantity < 0) {
//       return res.status(400).json({ message: 'Price and quantity must be non-negative' });
//     }

//     const sparePart = await SparePart.create({
//       name,
//       price,
//       picture,
//       quantity,
//       criticalLevel: criticalLevel || false,
//     });

//     return res.status(201).json({ message: 'Spare part created successfully', sparePart });
//   } catch (error) {
//     console.error('Error creating spare part:', error.stack);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const updateSparePart = async (req, res) => {
//   const { id } = req.params;
//   const { name, price, picture, quantity, criticalLevel } = req.body;

//   try {
//     if (!SparePart) {
//       console.error('SparePart model is not defined');
//       return res.status(500).json({ message: 'Server error: SparePart model not found' });
//     }

//     const sparePart = await SparePart.findByPk(id);
//     if (!sparePart) {
//       return res.status(404).json({ message: 'Spare part not found' });
//     }

//     // Validate input if provided
//     if (price != null && price < 0) {
//       return res.status(400).json({ message: 'Price must be non-negative' });
//     }
//     if (quantity != null && quantity < 0) {
//       return res.status(400).json({ message: 'Quantity must be non-negative' });
//     }

//     // Update only provided fields
//     const updateData = {};
//     if (name) updateData.name = name;
//     if (price != null) updateData.price = price;
//     if (picture !== undefined) updateData.picture = picture;
//     if (quantity != null) updateData.quantity = quantity;
//     if (criticalLevel !== undefined) updateData.criticalLevel = criticalLevel;

//     await sparePart.update(updateData);

//     const updatedSparePart = await SparePart.findByPk(id);

//     return res.status(200).json({ message: 'Spare part updated successfully', sparePart: updatedSparePart });
//   } catch (error) {
//     console.error('Error updating spare part:', error.stack);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const deleteSparePart = async (req, res) => {
//   const { id } = req.params;

//   try {
//     if (!SparePart) {
//       console.error('SparePart model is not defined');
//       return res.status(500).json({ message: 'Server error: SparePart model not found' });
//     }

//     const sparePart = await SparePart.findByPk(id);
//     if (!sparePart) {
//       return res.status(404).json({ message: 'Spare part not found' });
//     }

//     await sparePart.destroy();

//     return res.status(200).json({ message: 'Spare part deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting spare part:', error.stack);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// const uploadImage = (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     // Construct URL (you can adjust this depending on how you serve static files)
//     const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     return res.status(200).json({ imageUrl });
//   } catch (error) {
//     console.error('Error uploading image:', error.stack);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = {
//   getAllSpareParts,
//   getSparePartById,
//   createSparePart,
//   updateSparePart,
//   deleteSparePart,
//   uploadImage,
// };

const { SparePart } = require('../model');
const fs = require('fs');
const path = require('path');

const getAllSpareParts = async (req, res) => {
  try {
    if (!SparePart) {
      console.error('SparePart model is not defined');
      return res.status(500).json({ message: 'Server error: SparePart model not found' });
    }

    const spareParts = await SparePart.findAll({
      attributes: ['id', 'name', 'price', 'picture', 'quantity', 'criticalLevel', 'createdAt', 'updatedAt'],
    });

    return res.status(200).json(spareParts);
  } catch (error) {
    console.error('Error fetching spare parts:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSparePartById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!SparePart) {
      console.error('SparePart model is not defined');
      return res.status(500).json({ message: 'Server error: SparePart model not found' });
    }

    const sparePart = await SparePart.findByPk(id, {
      attributes: ['id', 'name', 'price', 'picture', 'quantity', 'criticalLevel', 'createdAt', 'updatedAt'],
    });

    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    return res.status(200).json(sparePart);
  } catch (error) {
    console.error('Error fetching spare part:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSparePart = async (req, res) => {
  const { name, price, picture, quantity, criticalLevel } = req.body;

  try {
    if (!SparePart) {
      console.error('SparePart model is not defined');
      return res.status(500).json({ message: 'Server error: SparePart model not found' });
    }

    // Validate input
    if (!name || price == null || quantity == null) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    if (price < 0 || quantity < 0) {
      return res.status(400).json({ message: 'Price and quantity must be non-negative' });
    }

    const sparePart = await SparePart.create({
      name,
      price,
      picture,
      quantity,
      criticalLevel: criticalLevel || false,
    });

    return res.status(201).json({ message: 'Spare part created successfully', sparePart });
  } catch (error) {
    console.error('Error creating spare part:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSparePart = async (req, res) => {
  const { id } = req.params;
  const { name, price, picture, quantity, criticalLevel } = req.body;

  try {
    if (!SparePart) {
      console.error('SparePart model is not defined');
      return res.status(500).json({ message: 'Server error: SparePart model not found' });
    }

    const sparePart = await SparePart.findByPk(id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // Validate input if provided
    if (price != null && price < 0) {
      return res.status(400).json({ message: 'Price must be non-negative' });
    }
    if (quantity != null && quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be non-negative' });
    }

    // Update only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (price != null) updateData.price = price;
    if (picture !== undefined) updateData.picture = picture;
    if (quantity != null) updateData.quantity = quantity;
    if (criticalLevel !== undefined) updateData.criticalLevel = criticalLevel;

    await sparePart.update(updateData);

    const updatedSparePart = await SparePart.findByPk(id);

    return res.status(200).json({ message: 'Spare part updated successfully', sparePart: updatedSparePart });
  } catch (error) {
    console.error('Error updating spare part:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSparePart = async (req, res) => {
  const { id } = req.params;

  try {
    if (!SparePart) {
      console.error('SparePart model is not defined');
      return res.status(500).json({ message: 'Server error: SparePart model not found' });
    }

    const sparePart = await SparePart.findByPk(id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    await sparePart.destroy();

    return res.status(200).json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting spare part:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct URL (you can adjust this depending on how you serve static files)
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSparePartQuantity = async (req, res) => {
  const { id } = req.params;
  const { reduceBy } = req.body;

  try {
    if (!SparePart) {
      console.error('SparePart model is not defined');
      return res.status(500).json({ message: 'Server error: SparePart model not found' });
    }

    const sparePart = await SparePart.findByPk(id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // Validate reduceBy
    if (reduceBy == null || typeof reduceBy !== 'number') {
      return res.status(400).json({ message: 'reduceBy must be a number' });
    }
    if (reduceBy <= 0) {
      return res.status(400).json({ message: 'reduceBy must be a positive number' });
    }
    if (sparePart.quantity < reduceBy) {
      return res.status(400).json({ message: 'Insufficient stock to reduce quantity' });
    }

    // Update quantity
    await sparePart.update({ quantity: sparePart.quantity - reduceBy });

    const updatedSparePart = await SparePart.findByPk(id, {
      attributes: ['id', 'name', 'price', 'picture', 'quantity', 'criticalLevel', 'createdAt', 'updatedAt'],
    });

    return res.status(200).json({
      message: 'Spare part quantity updated successfully',
      sparePart: updatedSparePart,
    });
  } catch (error) {
    console.error('Error updating spare part quantity:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  uploadImage,
  updateSparePartQuantity,
};