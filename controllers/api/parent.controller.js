const model = require("../../models/index");

module.exports = {
  getAll: async (req, res) => {
    try {
      const result = await model.Parent.findAll({
        include: model.User
      })
      res.status(200).json({ status: "Success", message: "Fetch data berhasil", result });
    } catch (error) {
      res.status(400).json({
        status: error.message,
        message: "Gagal",
      });
    }

  }
};
