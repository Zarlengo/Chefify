/*
    This file is the API connection for nutritionix.com

    The function takes two inputs:
        1) A reference function to run when the AJAX call is complete
        2) The parameters (as an object) for the query.

    Note:
        parameters object provided to the function must include a query and fields array (what items to return)

    ***** EXAMPLE *****
    function referenceFunction(results) {
        console.log(results);
    }

    GetNutritionix(referenceFunction, {query:"apple", fields:nutritionix_fields});
    ***** END EXAMPLE *****


*/


// https://developer.nutritionix.com/docs/v1_1
const API_Key_nutritionix = "9c2a6effb7mshee537b4b3bd2f59p13b141jsndd8cb676194a";
const API_authorization_nutritionix = { "method": "GET",    
                                        "headers": {
                                            "x-rapidapi-key": API_Key_nutritionix,
                                            "x-rapidapi-host": "nutritionix-api.p.rapidapi.com"}};
const nutritionix_fields = ["item_name",
                            "brand_name",
                            "nf_calories",
                            "nf_calories_from_fat",
                            "nf_total_fat",
                            "nf_saturated_fat",
                            "nf_monounsaturated_fat",
                            "nf_polyunsaturated_fat",
                            "nf_trans_fatty_acid",
                            "nf_cholesterol",
                            "nf_sodium",
                            "nf_total_carbohydrate",
                            "nf_dietary_fiber",
                            "nf_sugars",
                            "nf_protein",
                            "nf_vitamin_a_dv",
                            "nf_vitamin_c_dv",
                            "nf_calcium_dv",
                            "nf_iron_dv",
                            "nf_serving_size_qty",
                            "nf_serving_size_unit",
                            "nf_serving_weight_grams"];


function nutritionixURLConstruct(base_URL, additions_object) {
    let query_string = "";
    query_string += additions_object.query;
    query_string += `?fields=${additions_object.fields.join(",")}`;
    URL = `${base_URL}${query_string}`;
    return URL;
}


function GetNutritionix(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    API-field-name	            default	    data type (length)	field-description
    brand_name	                required	VARCHAR(255)    Name of brand which item belongs to
    item_name	                required	VARCHAR(500)	Item full name, such as Turkey Club Sandwich
    brand_id	                required	VARCHAR(24)	    Nutritionix ID for Food Brand
    item_id	                    required	VARCHAR(24)	    Nutritionix Unique ID for Item.  Example: 513fceb375b8dbbc21000003
    upc	                        null	    BIGINT(14)	    Integer.  Leading zeros has been stripped.  If using UPC scanning, make sure to strip leading zeros and convert UPC to integer before comparing to these values.  Only applicable to Grocery items (type 2)
    item_type	                null	    INT(2)	        1 = Restaurant, 2 = Grocery, 3 = Common food
    item_description	        null	    TEXT	        BETA If provided, 255 character max description of item, not applicable to most items.
    nf_ingredient_statement	    null	    TEXT	        If available, will contain comma delimited list of ingredients
    nf_calories	                null	    FLOAT(20,2)	    Unit of Measure: (kcal)
    nf_calories_from_fat	    null	    FLOAT(20,2)	    calculated by taking 9 * Fat Grams
    nf_total_fat	            null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_saturated_fat	        null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_monounsaturated_fat	    null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_polyunsaturated_fat	    null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_trans_fatty_acid	        null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_cholesterol	            null	    FLOAT(20,2)	    Unit of measure: (mg)
    nf_sodium	                null	    FLOAT(20,2)	    Unit of measure: (mg)
    nf_total_carbohydrate	    null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_dietary_fiber	        null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_sugars	                null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_protein	                null	    FLOAT(20,2)	    Unit of measure: (g)
    nf_vitamin_a_dv	            null	    FLOAT(20,2)	    daily value percentage expressed as integer, example: "40" would mean 40% DV of vitamin A
    nf_vitamin_c_dv	            null	    FLOAT(20,2)	    daily value percentage expressed as integer, example: "40" would mean 40% DV of vitamin C
    nf_calcium_dv	            null	    FLOAT(20,2)	    daily value percentage expressed as integer
    nf_iron_dv	                null	    FLOAT(20,2)	    daily value percentage expressed as integer
    nf_potassium	            null	    FLOAT(20,2)	    Unit of measure: (mg)
    nf_servings_per_container	null	    FLOAT(20,2)	    example: 2.  Generally applies to CPG products only
    nf_serving_size_qty	        null	    FLOAT(20,2)	    If serving size is 1 cup, the qty would have a value of "1"
    nf_serving_size_unit	    null	    VARCHAR(255)	If serving size is 1 cup, the unit would have a value of "cup"
    nf_serving_weight_grams	    null	    FLOAT(20,2)	    If serving weight is 228g the value would be "228"
    metric_qty	                null	    FLOAT(20,2)	    If serving weight is 228g, the value would be 228.
    metric_uom	                null	    VARCHAR(10)	    Either "g" or "ml".  If serving weight is 228ml, the value would be "ml".   Only applicable to grocery items.
    images_front_full_url	    null	    VARCHAR(255)	BETA - URL of the front of package image.  Meant for downloading only, do not hotlink to this URL.
    updated_at		                        DATETIME	    UNIX timestamp when item was last updated
    section_ids	                null	    VARCHAR(255)	BETA - currently applies to select restaurant items, displays a comma delimited list of section IDs
    */

    const search_URL = "https://nutritionix-api.p.rapidapi.com/v1_1/search/";
    
    let queryURL = nutritionixURLConstruct(search_URL, parameters);
    fetch(queryURL, API_authorization_nutritionix)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })
}