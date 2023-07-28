const express = require('express');
const router = express.Router();
const User = require('../models/product');
const multer = require('multer');
const users = require('../models/product');
const product = require('../models/product');

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now + "_" + file.originalname);
    },
});
var upload = multer({
    storage: storage,
}).single("image");

//insert product into database
router.post('/add', upload, (req, res) => {
    const product = new product({
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        image: req.file.filename,

    });
    product.save((err) => {
        if (err) {
            req.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'Product added successfully!'
            };
            res.redirect('/');
        }
    });
});


router.get("/", (req, res) => {
    product.find().exec((err, product) => {
        if (err) {
            res.json({
                message: err.message,
            });
        } else {
            res.render('index', {
                title: 'Home Page',
                product: product,
            });
        }
    });
});

router.get('/add', (req, res) => {
    res.render('add_products', { title: "Add Products" });
});

router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    product.findById(id, (err, product) => {
        if (err) {
            res.redirect('/');
        } else {
            if (product == null) {
                res.redirect('/');
            } else {
                res.render('edit_product'), {
                    title: 'Edit',
                    product: product,
                }
            }
        }
    });
});
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";
    if (req.file) {
        new_image = req.file.filename;
        try {
            FileSystem.unlikeSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }
    product.findByIdAndUpdate(id, {
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        image: new_image,
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'Product Updated Successfully',
            };
            res.redirect('/');
        }
    })
});

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    product.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                FileSystem.unlikeSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        if (err) {
            res.json({ message: err.message });
        } else {
            req.session.message = {
                type: 'success',
                message: 'Product Deleted Successfully',
            };
            res.redirect('/');
        }
    })
})
module.exports = router;