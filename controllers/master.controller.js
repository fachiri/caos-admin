const model = require("../models/index");
const apiConfig = require(`${__dirname}/../config/api.json`);
const bcrypt = require("bcryptjs");
const Sequelize = require('sequelize'); 
const op = Sequelize.Op;
module.exports = {
  users: async (req, res) => {
    const data = await model.User.findAll({
      attributes: ["uuid", "name", "email", "role", "status"],
    });
    res.render("./pages/users", { data });
  },
  storeUsers: async (req, res) => {
    let { name, email, role, password } = req.body;

    if (password == '') password = '12345678';

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
      }

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
    const {role, puskesmaId, posyanduId, userid} = req.session
    let regencies, myPuskesmas, myPosyandu, data
    const { url, idProv } = apiConfig;
    await fetch(`${url}/regencies/${idProv}.json`)
      .then((response) => response.json())
      .then((result) => (regencies = result));
    if (role == 'admin') {
      data = await model.Toddler.findAll({
        include: [
          { model: model.Puskesmas },
          { model: model.Posyandus }
        ]
      });
    }
    const puskesmas = await model.Puskesmas.findAll()
    const posyandu = await model.Posyandus.findAll()
    const parents = await model.Parent.findAll({
      attributes: ["id", "no_kk", "nama_ayah", "nama_ibu"],
    });
    if (puskesmaId) {
      myPuskesmas = await model.Puskesmas.findByPk(puskesmaId)
      myPosyandu = await model.Posyandus.findAll({
        where: { puskesmaId }
      })
      data = await model.Toddler.findAll({
        where: { puskesmaId },
        include: [
          { model: model.Puskesmas },
          { model: model.Posyandus }
        ]
      });
    }
    if (posyanduId) {
      myPosyandu = await model.Posyandus.findByPk(posyanduId, {
        include: model.Puskesmas
      })
      data = await model.Toddler.findAll({
        where: { posyanduId, puskesmaId: myPosyandu.Puskesma.id },
        include: [
          { model: model.Puskesmas },
          { model: model.Posyandus }
        ]
      });
    }
    res.render("./pages/toddlers", {
      data,
      regencies,
      url,
      idProv,
      puskesmas,
      posyandu,
      parents,
      myPuskesmas,
      myPosyandu
    });
  },
  storeToddler: async (req, res) => {
    try {
      const { nik, noBpjs, name, birth, anakKe, address, prov, kab, kec, puskesmas, posyandu, jk, parentId } = req.body;
      await model.Toddler.create({
        nik,
        no_bpjs: noBpjs,
        name,
        jk,
        birth,
        anak_ke: anakKe,
        address,
        prov,
        kab,
        kec,
        puskesmaId: puskesmas,
        posyanduId: posyandu,
        parentId
      })
      req.flash("alert", { hex: "#28ab55", color: "success", status: "Success" })
      req.flash("message", "Balita berhasil ditambahkan")
      res.redirect("/toddlers")
    } catch (error) {
      console.log(error)
      req.flash("alert", { hex: "#f3616d", color: "danger", status: "Failed" })
      req.flash("message", error.message)
      res.redirect("/toddlers")
    }
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
      include: model.Parent
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
      nik,
      noBpjs,
      name,
      birth,
      anakKe,
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
        nik,
        no_bpjs: noBpjs,
        name,
        jk,
        birth,
        anak_ke: anakKe,
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
    let redirectUri = "/users"
    if (req.query.from && req.query.from == "profile") {
      redirectUri = "/profile"
      password = ''
    }
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
      res.redirect(redirectUri);
    }

    if (!name) name = response.name;

    if (!email) email = response.email;

    if (!role) role = response.role;

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.log(err)
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
          res.redirect(redirectUri);
        })
        .catch((error) => {
          console.log(error)
          req.flash("alert", {
            hex: "#f3616d",
            color: "danger",
            status: "Gagal Update users baru",
          });
          res.redirect(redirectUri);
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
    let redirectUri = "/users"
    if (req.query.from && req.query.from == "parents") {
      redirectUri = "/parents"
    }
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
        res.status(200).redirect(redirectUri);
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
        res.status(400).redirect(redirectUri);
      });
  },
  parentsPage: async (req, res) => {
    const { puskesmaId, posyanduId } = req.session
    const parents = await model.User.findAll({
      where: { role: "masyarakat", puskesmaId, posyanduId },
      include: {
        model: model.Parent,
        where: {
          userId: {[op.col]: 'User.id'}
        }
      }
    })
    console.log(parents)
    res.render("./pages/parents", { parents });
  },
  parentsAdd: async (req, res) => {
    try {
      let { no_kk, nama_ayah, nama_ibu, nik_ayah, nik_ibu, no_bpjs_ayah, no_bpjs_ibu, name, email, password } = req.body
      if (!password) {
        password = '12345678'
      }
      // cek email
      const userData = await model.User.findOne({ where: { email } })
      if(userData) {
        throw new Error('Email ini tidak bisa digunakan!')
      }
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          throw new Error(err)
        }
        const storedUser = await model.User.create({
          name,
          email, 
          password: hash,
          posyanduId: req.session.posyanduId
        })
        await model.Parent.create({
          no_kk,
          nama_ayah,
          nama_ibu,
          nik_ayah,
          nik_ibu,
          no_bpjs_ayah,
          no_bpjs_ibu,
          userId: storedUser.id
        })
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", `Akun Orang Tua Berhasil Dibuat`);
        res.redirect("/parents");
      })      
    } catch (error) {
      console.log(error)
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Failed",
      })
      req.flash("message", error.message);
      res.redirect("/parents");
    }
  },
  parentDelete: async (req, res) => {
    try {
      const { uuid } = req.params
      const parent = await model.Parent.findOne({ where: { uuid }})
      if(!parent) {
        throw new Error('Data tidak ditemukan')
      }
      await model.Parent.destroy({ where: { uuid }})
      await model.Toddler.destroy({ where: { parentId: parent.id }})
      await model.User.destroy({ where: { id: parent.userId }})
      req.flash("alert", {
        hex: "#28ab55",
        color: "success",
        status: "Success",
      });
      req.flash("message", `Akun Orang Tua Berhasil Dihapus`);
      res.redirect("/parents");
    } catch (error) {
      console.log(error)
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Failed",
      })
      req.flash("message", error.message);
      res.redirect("/parents");
    }
  }
};
