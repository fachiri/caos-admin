const model = require("../models/index");
const fs = require("fs");
const path = require("path");

module.exports = {
  article: async (req, res) => {
    const data = await model.Category.findAll();
    res.render("./pages/insertArticle", { data });
  },
  insertarticle: async (req, res) => {
    const { title, category, bodyArticle } = req.body;
    const image = req.files.foto;
    //image setting
    const ext = path.extname(image.name);
    const fileName = image.md5 + Math.floor(Date.now() / 1000) + ext;
    const image_url = `${req.protocol}://${req.get(
      "host"
    )}/images/uploads/${fileName}`;
    const newpath = `${__dirname}/../public/images/uploads/${fileName}`;
    await image.mv(newpath);

    // Hitung jumlah byte yang dibutuhkan untuk menyimpan teks
    const byteLength = Buffer.byteLength(bodyArticle, "utf8");

    // Konversi byte ke MB dengan membagi dengan 1.000.000
    const sizeInMb = byteLength / 1000000;
    console.log(`Ukuran teks: ${sizeInMb} MB`);

    // console.log(image);
    let finalSlug = title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\W+/g, "-")
      .toLowerCase();
    if (finalSlug.endsWith("-"))
      finalSlug = finalSlug.slice(0, finalSlug.length - 1);
    if (finalSlug.startsWith("-"))
      finalSlug = finalSlug.slice(1, finalSlug.length);

    // console.log(url);
    const data = await model.User.findOne({
      where: {
        uuid: req.session.userid,
      },
    });

    const idCategory = await model.Category.findOne({
      where: {
        name: category,
      },
    });

    console.log(idCategory);

    await model.Article.create({
      title,
      category,
      categoryId: idCategory.id,
      body: bodyArticle,
      image_name: fileName,
      url: image_url,
      slug: finalSlug,
      userId: data.id,
    })
      .then((result) => {
        req.flash("alert", {
          hex: "#28ab55",
          color: "success",
          status: "Success",
        });
        req.flash("message", `Artikel Berhasil Dibuat`);
        res.status(201);
      })
      .catch((error) => {
        // console.log(error);
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Failed",
        });
        req.flash("message", error.message);
        res.status(400);
      });
    res.redirect("/insertarticle");
  },
  getarticle: async (req, res) => {
    const data = await model.Article.findAll({
      attributes: [
        "title",
        "category",
        "createdAt",
        "updatedAt",
        "slug",
        "uuid",
      ],
    });
    // console.log(data);
    res.render("./pages/getArticle", { data });
  },
  getDetailArticle: async (req, res) => {
    const data = await model.Article.findAll({
      include: [
        {
          model: model.User,
          attributes: ["name"],
        },
      ],
      where: {
        slug: req.params.slug,
      },
    });
    res.render("./pages/detailArticle", { data });
  },
  deleteArticle: async (req, res) => {
    const response = await model.Article.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });
    if (!response) {
      req.flash("alert", {
        hex: "#f3616d",
        color: "danger",
        status: "Article tidak ditemukan",
      });
      res.status(404);
      res.redirect("/categories");
    }
    await model.Article.destroy({
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
          `Berhasil Hapus Article dengan Judul ${response.title}`
        );
        res.status(200);
        res.redirect("/getarticle");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: "Gagal Hapus Article",
        });
        res.redirect("/getarticle");
      });
  },
  editArticle: async (req, res) => {
    const data = await model.Article.findAll({
      where: {
        slug: req.params.slug,
      },
    });
    const categories = await model.Category.findAll({
      attributes: ["name"],
    });
    res.render("./pages/editArticle", { data, categories });
  },

  editArticlePut: async (req, res) => {
    const { title, body, category } = req.body;
    let imageFix;

    const data = await model.Article.findOne({
      where: {
        slug: req.params.slug,
      },
    });
    if (!req.files) {
      imageFix = data.image_name;
    } else {
      const image = req.files.foto;
      const ext = path.extname(image.name);
      const fileName = image.md5 + Math.floor(Date.now() / 1000) + ext;
      const newpath = `${__dirname}/../public/images/uploads/${fileName}`;
      await image.mv(newpath);
      imageFix = fileName;
    }
    const url = `${req.protocol}://${req.get("host")}/images/${imageFix}`;
    await model.Article.update(
      {
        title,
        body,
        category,
        image_name: imageFix,
        image_url: url,
      },
      {
        where: {
          slug: data.slug,
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
          `Berhasil Update Article dengan Judul ${data.title}`
        );
        res.status(200);
        res.redirect("/getarticle");
      })
      .catch((result) => {
        req.flash("alert", {
          hex: "#f3616d",
          color: "danger",
          status: result.message,
        });
        res.redirect("/getarticle");
      });
  },
};
