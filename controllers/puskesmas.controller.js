const model = require("../models/index");

module.exports = {
  getPuskesmas: async (req, res) => {
    const data = await model.Puskesmas.findAll({
      include: [
        {
          model: model.Posyandus
        },
        {
          model: model.User
        }
      ],
      attributes: ["id", "uuid", "nama", "alamat"],
    });

    const users = await model.User.findAll({
      attributes: ["id", "name", "puskesmaId"],
      where: {
        role: "admin_puskesmas"
      },
      include: [{
        model: model.Puskesmas,
        attributes: ['nama']
      }]
    })

    res.render("./pages/puskesmas", { data, users });
  },
  getPuskesmasById: async (req, res) => {
    console.log("oke");
  },
  storePuskesmas: async (req, res) => {
    const { nama, alamat, id_user } = req.body;
    await model.Puskesmas.create({
      nama,
      alamat,
    })
      .then(async (result) => {
        const puskesmaId = result.id
        await model.User.update({
            puskesmaId
          }, {
            where: {
              id: id_user
            }
          })
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", `Puskesmas Berhasil Ditambahkan`);
        res.status(201);
        res.redirect("/puskesmas");
      })
      .catch((err) => {
        console.log(err);
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal Menambahkan Puskesmas");
        res.status(400);
        res.redirect("/puskesmas");
      });
  },
  updatePuskesmas: async (req, res) => {
    let { nama, alamat, id_user } = req.body;
    let redirectUri = "/puskesmas"
    if (req.query.from && req.query.from == "profile") {
      redirectUri = "/profile"
    }
    const response = await model.Puskesmas.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "User tidak ditemukan",
      });
      res.redirect(redirectUri);
    }

    if (!nama) {
      nama = response.nama;
    }
    if (!alamat) {
      alamat = response.alamat;
    }

    await model.Puskesmas.update(
      {
        nama,
        alamat,
      },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    )
      .then(async (result) => {
        if(id_user) {
          await model.User.update({
              puskesmaId: response.id
            }, {
              where: {
                id: id_user
              }
            })
        }
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash(
          "message",
          `Berhasil Update Puskesmas dengan nama ${response.nama}`
        );
        res.status(201);
        res.redirect(redirectUri);
      })
      .catch((error) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Update Puskesmas baru",
        });
        res.redirect(redirectUri);
      });
  },
  deletePuskesmas: async (req, res) => {
    const response = await model.Puskesmas.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Puskesmas tidak ditemukan",
      });
      res.redirect("/puskesmas");
    }
    await model.Puskesmas.destroy({
      where: {
        uuid: response.uuid,
      },
    })
      .then((result) => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash(
          "message",
          `Berhasil Hapus Puskesmas dengan nama ${response.nama}`
        );
        res.status(200);
        res.redirect("/puskesmas");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Hapus Puskesmas",
        });
        res.redirect("/puskesmas");
      });
  },
};
