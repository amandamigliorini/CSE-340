const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")


const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleDetails(inv_id)
  const grid = await utilities.buildVehicleDetails(data)
  let nav = await utilities.getNav()
  const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
  res.render("./inventory/details", {
    title: className,
    nav,
    grid,
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null
  })
}

/* ****************************************
*  Process Classification
* *************************************** */
invCont.manageClassification = async function (req, res) {
  const { classification_name } = req.body
  const managementResult = await invModel.addClassification(
   classification_name
  )
  let nav = await utilities.getNav()

  if (managementResult) {
    req.flash(
      "notice",
      `The newcar classification was succesfully aded.`
    )
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    });
  } else {
    req.flash("notice", "Provide a correct clasification name.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  }
}

/* ****************************************
*  Process new vehicle
* *************************************** */
invCont.manageInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body


  const vehicleResult = await invModel.addNewVehicle(
    classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )

  if (vehicleResult) {
    req.flash(
      "notice",
      `The new vehicle was succesfully aded.`
    )
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    });
  } else {
    req.flash("notice", "Sorry, the vehicle could not be added. Please try again.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: null
    })
  }
}




module.exports = invCont