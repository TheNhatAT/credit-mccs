// read the mcc.json file and create object with the data
const fs = require("fs");
const path = require("path");

const mccPath = path.join(__dirname, "./local-data/mcc.json");
const mccData = fs.readFileSync(mccPath, "utf8");
const mccCodes = JSON.parse(mccData)["results"];

const vibCategoryPath = path.join(__dirname, "./local-data/category/vib.json");
const vibCategoryData = fs.readFileSync(vibCategoryPath, "utf8");
const vibCategories = JSON.parse(vibCategoryData);

function transformVibCategories() {
  // transform mccs string to array of integers
  for (let i = 0; i < 3; i++) {
    let mccs = vibCategories[i]["mccs"];

    vibCategories[i]["mccs"] = mccs.split(",").map((mcc) => {
      return mcc.trim();
    });
  }
}

function mapCategory(mccCode) {
  let categoryId = 0;
  for (let i = 0; i < vibCategories.length; i++) {
    const category = vibCategories[i];
    for (let j = 0; j < category["mccs"].length; j++) {
      if (category["mccs"][j] == mccCode) {
        categoryId = category["id"];
        break;
      }
    }
  }

  return categoryId;
}

function handleMccCodes() {
  transformVibCategories();

  let mccVibs = [];
  for (let i = 0; i < mccCodes.length; i++) {
    const mccCode = mccCodes[i][2];
    const categoryId = mapCategory(mccCode);

    mccVibs.push({
      id: mccCodes[i][0],
      name: mccCodes[i][1],
      code: mccCode,
      paymentType: mccCodes[i][3],
      categoryId: categoryId,
      refIndustry: mccCodes[i][4],
    });
  }

  return mccVibs;
}

const mccVibs = handleMccCodes();

for (let i = 0; i < mccVibs.length; i++) {
  if (mccVibs[i]["categoryId"] > 0) {
    let categoryName = vibCategories.find(
      (category) => category["id"] == mccVibs[i]["categoryId"]
    )["name"];

    let aggregateMccVib = {
      id: mccVibs[i]["id"],
      name: mccVibs[i]["name"],
      code: mccVibs[i]["code"],
      paymentType: mccVibs[i]["paymentType"],
      categoryName: categoryName,
      refIndustry: mccVibs[i]["refIndustry"],
    };

    console.log(aggregateMccVib);
  }
}

//TODO: full text search in the mccVibs array in field name
// approach 1: save in postgres and use index
// approach 2: use in-memory search algorithm
