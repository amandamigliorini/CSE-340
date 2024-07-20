const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* Get vehicle details function by inventory_id */

async function getVehicleDetails(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
       WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* Add Classification function*/

async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* check if classification already exists in the database */

async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const clasification = await pool.query(sql, [classification_name])
    return clasification.rowCount
  } catch (error) {
    return error.message
  }

}

/* Add new Vehicle function*/

async function addNewVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color){
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


/* ***************************
 *  delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql =
      "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [
      inv_id
    ])
    if (!data.rows[0]){
      return true
    }
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function checkIfIsFavorite(account_id, inv_id) {
  try {
    const result = await pool.query(
      'SELECT FROM public.favorite_items fi JOIN public.favorites f ON fi.fav_id = f.fav_id where f.account_id= $1 AND FI.INV_ID = $2',
      [account_id, inv_id])
      console.log(result.rows)
    return result.rows[0]
  } catch (error) {
    return new Error("Item not Found")
  }
}

async function addToFavorites(account_id, inv_id) {
  try {
    // Check if the favorites list exists
    const resultFavId = await pool.query(
      'SELECT fav_id FROM public.favorites WHERE account_id = $1',
      [account_id]
    );

    let favId;

    // If favorites list does not exist, create it
    if (resultFavId.rows.length === 0) {
      const resultFavListCreate = await pool.query(
        'INSERT INTO public.favorites (account_id) VALUES ($1) RETURNING fav_id',
        [account_id]
      );
      favId = resultFavListCreate.rows[0].fav_id;
    } else {
      favId = resultFavId.rows[0].fav_id;
    }

    // Add the item to the favorites list
    const result = await pool.query(
      'INSERT INTO public.favorite_items (fav_id, inv_id, fav_item_note) VALUES ($1, $2, $3) RETURNING *',
      [favId, inv_id, 'Insert a personal note']
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw new Error('Error adding to favorites:' + error.message);
  }
}

async function removeFromFavorites(account_id, inv_id) {
  try {
    // Get the fav_id for the account
    const resultFavId = await pool.query(
      'SELECT fav_id FROM public.favorites WHERE account_id = $1',
      [account_id]
    );

    if (resultFavId.rows.length === 0) {
      throw new Error("Favorites list not found");
    }

    const favId = resultFavId.rows[0].fav_id;

    // Remove the item from the favorites list
    const result = await pool.query(
      'DELETE FROM public.favorite_items WHERE fav_id = $1 AND inv_id = $2 RETURNING *',
      [favId, inv_id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw new Error('Error removing from favorites:' + error.message);
  }
}

async function getFavoriteItems(account_id) {
  try {
    const result = await pool.query(
      'SELECT fi.fav_id, inv_id, fav_item_note FROM public.favorite_items fi JOIN public.favorites f ON fi.fav_id = f.fav_id where f.account_id= $1',
      [account_id])
    return result.rows
  } catch (error) {
    return new Error("Item not Found")
  }
}

async function updateFavoriteNote(fav_id, inv_id, fav_inv_note) {
  try {
    const result = await pool.query(
      'UPDATE favorite_items SET fav_item_note = $1 WHERE FAV_ID = $2 AND inv_id = $3',
      [fav_inv_note, fav_id, inv_id])
      return result
  } catch (error) {
    return new Error("Item not updated")
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleDetails, addClassification, checkExistingClassification, addNewVehicle, updateInventory, deleteInventoryItem, checkIfIsFavorite, addToFavorites, removeFromFavorites, getFavoriteItems, updateFavoriteNote};