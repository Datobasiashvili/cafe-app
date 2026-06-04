const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const menuItems = [
  // სალათები
  { product: "ცეზარი", price: 26, category: "სალათები" },
  { product: "ბერძნული სალათი", price: 22, category: "სალათები" },
  { product: "კიტრი-პომიდვრის სალათი", price: 16, category: "სალათები" },

  // პიცა
  { product: "4 ყველით (8 ნაჭ.)", price: 28, category: "პიცა" },
  { product: "4 ყველით (6 ნაჭ.)", price: 24, category: "პიცა" },
  { product: "პეპერონი (8 ნაჭ.)", price: 28, category: "პიცა" },
  { product: "პეპერონი (6 ნაჭ.)", price: 24, category: "პიცა" },
  { product: "მარგარიტა (8 ნაჭ.)", price: 26, category: "პიცა" },
  { product: "მარგარიტა (6 ნაჭ.)", price: 22, category: "პიცა" },

  // ხაჭაპური
  { product: "იმერული (8 ნაჭ.)", price: 22, category: "ხაჭაპური" },
  { product: "იმერული (6 ნაჭ.)", price: 18, category: "ხაჭაპური" },

  // სნექები და ფასტფუდი
  { product: "კარტოფილი ფრი კეჩუპით", price: 12, category: "სნექები და ფასტფუდი" },
  { product: "დიდი ჰოტდოგი ფრით და კეჩუპით", price: 22, category: "სნექები და ფასტფუდი" },
  { product: "ჰოტდოგის მენიუ (5 ჰოტდ., ფრი, კეჩ.)", price: 22, category: "სნექები და ფასტფუდი" },
  { product: "ქლაბსენდვიჩი ფრით და კეჩუპით", price: 26, category: "სნექები და ფასტფუდი" },

  // ბრუსკეტი (5 ცალი)
  { product: "კრემყველით და პეპერონით", price: 20, category: "ბრუსკეტი" },
  { product: "კრემყველით და პროშუტოთი", price: 20, category: "ბრუსკეტი" },
  { product: "კრემყველით, ჩერიპომიდვრით და ზეითისხილით", price: 20, category: "ბრუსკეტი" },

  // დესერტი
  { product: "ნაყინი", price: 8, category: "დესერტი" },

  // უალკოჰოლო სასმელები
  { product: "წყალი (0.5 ლ)", price: 3, category: "უალკოჰოლო სასმელები" },
  { product: "კოკა-კოლა", price: 5, category: "უალკოჰოლო სასმელები" },
  { product: "კოკა-კოლა ზერო", price: 5, category: "უალკოჰოლო სასმელები" },
  { product: "წვენი", price: 7, category: "უალკოჰოლო სასმელები" },

  // ყავა
  { product: "ამერიკანო", price: 6, category: "ყავა" },
  { product: "ამერიკანო ცივი", price: 6, category: "ყავა" },
  { product: "ცივი ყავა", price: 12, category: "ყავა" },
  { product: "ცივი ყავა ნაყინით", price: 16, category: "ყავა" },

  // ალკოჰოლური სასმელები
  { product: "აპეროლ შპრიცი", price: 24, category: "ალკოჰოლური სასმელები" },
  { product: "ჯინტონიკი", price: 22, category: "ალკოჰოლური სასმელები" },
  { product: "ლუდი კორონა", price: 12, category: "ალკოჰოლური სასმელები" },
  { product: "ლუდი ჰეინეკენი", price: 12, category: "ალკოჰოლური სასმელები" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    const inserted = await Product.insertMany(menuItems);
    console.log(`Successfully seeded ${inserted.length} products`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();