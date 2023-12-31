//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
    useNewUrlParser: true
  });

  const itemsSchema = {
    name: String
  };

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);


  const Item = mongoose.model("item", itemsSchema);

  const item1 = new Item({
    name: "Welcome to your todolist!."
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultItems = [item1, item2, item3];




  app.get("/", function(req, res) {



    Item.find({}, function(err, founditems) {
      if (founditems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully added the elements");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: founditems
        });
      }

    })
  });

  app.get("/:customListName", function(req, res) {
    const customListName = req.params.customListName;

      List.findOne({name: customListName},function(err,foundList){
        if(!err){
          if(!foundList){
            const list = new List({
              name: customListName,
              items: defaultItems
            });

            list.save();

            res.redirect("/"+customListName);

          }else{
            res.render("List", {
              listTitle: customListName,
              newListItems: foundList.items
            })
          }
        }
      });


  });

  app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const  listName = req.body.list;

    const item=new Item({
      name:itemName
    })

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    } else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }



  });


  app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    });


  });

  app.get("/about", function(req, res) {
    res.render("about");
  });

  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
}
