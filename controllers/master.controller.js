const model = require("../models/index");
const apiConfig = require(`${__dirname}/../config/api.json`);
const bcrypt = require("bcryptjs");
module.exports = {
  users: async (req, res) => {
    const data = await model.User.findAll({
      attributes: ["uuid", "name", "email", "role", "status"],
    });
    res.render("./pages/users", { data });
  },
  storeUsers: async (req, res) => {
    console.log("wleo");
    let { name, email, role, password } = req.body;

    if (password === null) password = /(\w+)@/g.exec(email)[1];

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
      }

      console.log("asdhaoidhawoidhawiodhawoidhawoidhaohd");
      await model.User.create({
        name: name,
        email: email,
        role: role,
        password: hash,
      })
        .then((result) => {
          req.flash("alert", {
            hex: "#28ab55",
            color: "success",
            status: "Success",
          });
          req.flash("message", `User baru berhasil ditambahkan`);
          res.status(201);
          res.redirect("/users");
        })
        .catch((err) => {
          console.log(err);
          req.flash("alert", {
            hex: "#f3616d",
            color: "danger",
            status: "Gagal Menambahkan users baru",
          });
          res.redirect("/users");
        });
    });
  },
  categories: async (req, res) => {
    const data = await model.Category.findAll({
      attributes: ["name", "description"],
    });
    res.render("./pages/categories", { data });
  },
  storecategory: async (req, res) => {
    const { name, description } = req.body;
    await model.Category.create({
      name,
      description,
    })
      .then(() => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", "Kategori berhasil ditambahkan");
        res.redirect("/categories");
      })
      .catch(() => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal menambahkan kategori");
        res.redirect("/categories");
      });
  },
  toddlers: async (req, res) => {
    let regencies;
    const { url, idProv } = apiConfig;
    await fetch(`${url}/regencies/${idProv}.json`)
      .then((response) => response.json())
      .then((result) => (regencies = result));
    const data = await model.Toddler.findAll({
      attributes: ["uuid", "name", "birth", "puskesmas", "posyandu"],
    });
    const puskesmas = await model.Puskesmas.findAll({
      attributes: ["uuid", "nama"],
    });
    const posyandu = await model.Posyandus.findAll({
      attributes: ["uuid", "nama"],
    });
    res.render("./pages/toddlers", {
      data,
      regencies,
      url,
      idProv,
      puskesmas,
      posyandu,
    });
  },
  storeToddler: async (req, res) => {
    const {
      noKk,
      nik,
      noBpjs,
      name,
      birth,
      anakKe,
      nikAyah,
      namaAyah,
      noBpjsAyah,
      nikIbu,
      namaIbu,
      noBpjsIbu,
      address,
      prov,
      kab,
      kec,
      puskesmas,
      posyandu,
      jk,
    } = req.body;
    await model.Toddler.create({
      no_kk: noKk,
      nik,
      no_bpjs: noBpjs,
      name,
      jk,
      birth,
      anak_ke: anakKe,
      nik_ayah: nikAyah,
      nama_ayah: namaAyah,
      no_bpjs_ayah: noBpjsAyah,
      nik_ibu: nikIbu,
      nama_ibu: namaIbu,
      no_bpjs_ibu: noBpjsIbu,
      address,
      prov,
      kab,
      kec,
      puskesmas,
      posyandu,
    })
      .then(() => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", "Balita berhasil ditambahkan");
      })
      .catch((err) => {
        if (err) {
          console.log(err.errors);
        }
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal menambahkan data");
      });
    res.redirect("/toddlers");
  },
  editToddlerPage: async (req, res) => {
    let regencies;
    const { url, idProv } = apiConfig;
    await fetch(`${url}/regencies/${idProv}.json`)
      .then((response) => response.json())
      .then((result) => (regencies = result));
    const puskesmas = await model.Puskesmas.findAll({
      attributes: ["uuid", "nama"],
    });
    const posyandu = await model.Posyandus.findAll({
      attributes: ["uuid", "nama"],
    });
    const data = await model.Toddler.findOne({
      where: { uuid: req.params.uuid },
      attributes: [
        "uuid",
        "no_kk",
        "nik",
        "no_bpjs",
        "name",
        "jk",
        "birth",
        "anak_ke",
        "nik_ayah",
        "nama_ayah",
        "no_bpjs_ayah",
        "nik_ibu",
        "nama_ibu",
        "no_bpjs_ibu",
        "address",
        "prov",
        "kab",
        "kec",
        "puskesmas",
        "posyandu",
      ],
    });
    res.render("./pages/editToddler", {
      data,
      regencies,
      url,
      idProv,
      puskesmas,
      posyandu,
    });
  },
  editToddler: async (req, res) => {
    const {
      noKk,
      nik,
      noBpjs,
      name,
      birth,
      anakKe,
      nikAyah,
      namaAyah,
      noBpjsAyah,
      nikIbu,
      namaIbu,
      noBpjsIbu,
      address,
      prov,
      kab,
      kec,
      puskesmas,
      posyandu,
      jk,
    } = req.body;
    await model.Toddler.update(
      {
        no_kk: noKk,
        nik,
        no_bpjs: noBpjs,
        name,
        jk,
        birth,
        anak_ke: anakKe,
        nik_ayah: nikAyah,
        nama_ayah: namaAyah,
        no_bpjs_ayah: noBpjsAyah,
        nik_ibu: nikIbu,
        nama_ibu: namaIbu,
        no_bpjs_ibu: noBpjsIbu,
        address,
        prov,
        kab,
        kec,
        puskesmas,
        posyandu,
      },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    )
      .then(() => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", "Data berhasil diedit");
      })
      .catch((err) => {
        if (err) {
          console.log(err.errors);
        }
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal mengedit data");
      });
    res.redirect("/toddler/edit/" + req.params.uuid);
  },
  deleteToddlerPage: async (req, res) => {
    const response = await model.Toddler.findOne({
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
      res.redirect("/toddlers");
    }
    await model.Toddler.destroy({
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
          `Berhasil Hapus Balita dengan nama ${response.name}`
        );
        res.status(200);
        res.redirect("/toddlers");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Hapus Balita",
        });
        res.status(400);
        res.redirect("/toddlers");
      });
  },
  updateUser: async (req, res) => {
    let { name, email, role, password } = req.body;
    const response = await model.User.findOne({
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
      res.redirect("/users");
    }

    if (!name) name = response.name;

    if (!email) email = response.email;

    if (!role) role = response.role;

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
      }
      if (!password) {
        password = response.password;
      } else {
        password = hash;
      }

      await model.User.update(
        {
          name,
          email,
          role,
          password,
        },
        {
          where: {
            uuid: req.params.uuid,
          },
        }
      )
        .then((result) => {
          console.log("then");
          req.flash("alert", {
            hex: "#28ab55",
            color: "success",
            status: "Success",
          });
          req.flash(
            "message",
            `Berhasil Update User dengan nama ${response.name}`
          );
          res.status(201);
          res.redirect("/users");
        })
        .catch((result) => {
          req.flash("alert", {
            hex: "#f3616d",
            color: "danger",
            status: "Gagal Update users baru",
          });
          res.redirect("/users");
        });
    });
  },

  deleteUser: async (req, res) => {
    const response = await model.User.findOne({
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
      res.redirect("/users");
    }
    await model.User.destroy({
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
          `Berhasil Hapus User dengan nama ${response.name}`
        );
        res.status(200);
        res.redirect("/users");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Hapus users",
        });
        res.redirect("/users");
      });
  },
  categories: async (req, res) => {
    const data = await model.Category.findAll({
      attributes: ["uuid", "name", "description"],
    });
    res.render("./pages/categories", { data });
  },
  storecategory: async (req, res) => {
    const { name, description } = req.body;
    await model.Category.create({
      name,
      description,
    })
      .then(() => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", "Kategori berhasil ditambahkan");
        res.redirect("/categories");
      })
      .catch(() => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Gagal menambahkan kategori");
        res.redirect("/categories");
      });
  },
  updateCategory: async (req, res) => {
    let { name, description } = req.body;
    const response = await model.Category.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Failed",
      });
      req.flash("message", "Category tidak ditemukan");
      res.redirect("/categories");
    }
    console.log(response.name);
    if (!name) name = response.name;
    if (!description) description = response.description;

    await model.Category.update(
      {
        name,
        description,
      },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    )
      .then((result) => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash(
          "message",
          `Kategori dengan nama ${response.name} berhasil diupdate`
        );
        res.redirect("/categories");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", "Category gagal diupdate");
        res.redirect("/categories");
      });
  },
  deleteCategory: async (req, res) => {
    const response = await model.Category.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Kategori tidak ditemukan",
      });
      res.redirect("/categories");
    }
    await model.Category.destroy({
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
          `Berhasil Hapus Kategori dengan nama ${response.name}`
        );
        res.status(200);
        res.redirect("/categories");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Hapus Kategori",
        });
        res.redirect("/categories");
      });
  },
  editStatusUser: async (req, res) => {
    let statusUpdate;
    let dump;
    const data = await model.User.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (data.status === "active") {
      statusUpdate = "inactive";
      dump = "Menonaktifkan";
    } else {
      statusUpdate = "active";
      dump = "Mengaktifkan";
    }

    await model.User.update(
      {
        status: statusUpdate,
      },
      {
        where: { uuid: req.params.uuid },
      }
    )
      .then((result) => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", `Berhasil ${dump} akun dengan nama ${data.name}`);
        res.status(200).redirect("/users");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash(
          "message",
          `Gagal gagal ${dump} akun dengan nama ${data.name}`
        );
        res.status(400).redirect("/users");
      });
  },
};
