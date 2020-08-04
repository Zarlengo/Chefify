/*
    This file is the API connection for spoonacular.com. The current list of available functions are:
        GetRecipes
        GetRecipesByNutrients
        GetRecipesByIngredients
        GetRecipeByID
        GetRecipeByIDs
        GetSimilarRecipes
        GetRandomRecipes
        GetRecipeEquipment
        GetRecipeIngredients
        GetRecipeSummary

    Each function takes two inputs:
        1) A reference function to run when the AJAX call is complete
        2) The parameters (as an object) for the query.

    Note:
        * Most results only show 10 as default
        * Image URL's can be constructed with SpoonImageURL. Provide:
            1) "image" which is provided in results => "image": "10-Minute-Zucchini-Pasta-with-Vegan-Cashew-Basil-Pesto-608242.jpg"
            2) Size of the image you want, see within the function for allowed sizes
            3) Image category desired (recipeImages and ingredients will be the two primary ones used)



    ***** EXAMPLE *****
    function function_to_call_when_query_is_done(results) {
        // Do something with results object (i.e. process / place in HTML)
        console.log(results);
    }

    GetRecipes(function_to_call_when_query_is_done, {cuisine: "thai"});
    ***** END EXAMPLE *****


*/


// https://spoonacular.com/food-api
const API_Key_spoon = "45f877fc1ab249ed8d92e20e95994577";
const API_authorization_spoon = `apiKey=${API_Key_spoon}`;

function URLConstruct(base_URL, authorization, additions_object) {
    let URL;
    if (additions_object === {}) {
        URL = `${base_URL}?${authorization}`;
    } else {
        let additions_keys = Object.keys(additions_object);
        let query_string = "";
        additions_keys.forEach(element => {
            query_string = query_string.concat(`&${element}=${additions_object[element]}`);
        });
        URL = `${base_URL}?${authorization}${query_string}`;
    }
    return URL;
}

function SpoonImageURL(image, image_type, size, image_category) {
    let ingredient_sizes = ["100x100", "250x250", "500x500"];
    let recipe_sizes = ["90x90", "240x150", "312x150", "312x231", "480x360", "556x370", "636x393"];
    let product_sizes = ["90x90", "312x231", "636x393"];

    // Function to modify the image name to include the image size
    function GetImageName() {
        // Formats the image for the API call
        return `${image}-${size}.${image_type}`;
    }

    switch (image_category) {
        case "ingredients":
            if (!ingredient_sizes.includes(size)){
                size = ingredient_sizes[0];
            }
            return `https://spoonacular.com/cdn/ingredients_${size}/${image}`;

        case "equipment":
            if (!ingredient_sizes.includes(size)){      // Uses the same sizes as ingredients
                size = ingredient_sizes[0];
            }
            return `https://spoonacular.com/cdn/equipment_${size}/${image}`;

        case "recipeImages":
            if (!recipe_sizes.includes(size)){
                return `https://spoonacular.com/recipeImages/${image}`;
            }
            return `https://spoonacular.com/recipeImages/${GetImageName()}`;

        case "productImages":
            if (!product_sizes.includes(size)){
                return `https://spoonacular.com/productImages/${GetImageName}`;
            }

        case "menuItem":
            if (!product_sizes.includes(size)){         // Same sizes as product images
                return `https://images.spoonacular.com/file/wximages/${GetImageName}`;
            }
    }

}

function GetRecipes(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	                Type	Example	    Description
    query	                string	burger	    The (natural language) recipe search query.
    cuisine	                string	italian	    The cuisine(s) of the recipes. One or more comma separated. See a full list of supported cuisines.
    diet	                string	vegetarian  The diet for which the recipes must be suitable. See a full list of supported diets.
    excludeIngredients	    string	eggs	    A comma-separated list of ingredients or ingredient types that the recipes must not contain.
    intolerances	        string	gluten	    A comma-separated list of intolerances. All recipes returned must not contain ingredients that are not suitable for people with the intolerances entered. See a full list of supported intolerances. Please note: due to the automatic nature of the recipe analysis, the API cannot be 100% accurate in all cases. Please advise your users to seek professional help with medical issues.
    offset	                number	0	        The number of results to skip (between 0 and 900).
    number	                number	10	        The number of results to return (between 1 and 100).
    limitLicense	        boolean	true	    Whether the recipes should have an open license that allows display with proper attribution.
    instructionsRequired	boolean	true	    Whether the recipes must have instructions.
    */

    const spoon_URL = "https://api.spoonacular.com/recipes/search";
    
    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);
    console.log(queryURL);
    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request.results);
    })
}

function GetRecipesComplex(ReferenceFunction, parameters = {}) {
    const spoon_URL = "https://api.spoonacular.com/recipes/complexSearch";
    
    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);
    console.log(queryURL);
    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request.results);
    })

}

function GetRecipesByNutrients(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	        Type	Example	Description
    minCarbs	    number	10	    The minimum amount of carbohydrates in grams the recipe must have.
    maxCarbs	    number	100	    The maximum amount of carbohydrates in grams the recipe can have.
    minProtein	    number	10	    The minimum amount of protein in grams the recipe must have.
    maxProtein	    number	100	    The maximum amount of protein in grams the recipe can have.
    minCalories	    number	50	    The minimum amount of calories the recipe must have.
    maxCalories	    number	800	    The maximum amount of calories the recipe can have.
    minFat	        number	1	    The minimum amount of fat in grams the recipe must have.
    maxFat	        number	100	    The maximum amount of fat in grams the recipe can have.
    minAlcohol	    number	0	    The minimum amount of alcohol in grams the recipe must have.
    maxAlcohol	    number	100	    The maximum amount of alcohol in grams the recipe can have.
    minCaffeine	    number	0	    The minimum amount of caffeine in milligrams the recipe must have.
    maxCaffeine	    number	100	    The maximum amount of caffeine in milligrams the recipe can have.
    minCopper	    number	0	    The minimum amount of copper in milligrams the recipe must have.
    maxCopper	    number	100	    The maximum amount of copper in milligrams the recipe can have.
    minCalcium	    number	0	    The minimum amount of calcium in milligrams the recipe must have.
    maxCalcium	    number	100	    The maximum amount of calcium in milligrams the recipe can have.
    minCholine	    number	0	    The minimum amount of choline in milligrams the recipe must have.
    maxCholine	    number	100	    The maximum amount of choline in milligrams the recipe can have.
    minCholesterol	number	0	    The minimum amount of cholesterol in milligrams the recipe must have.
    maxCholesterol	number	100	    The maximum amount of cholesterol in milligrams the recipe can have.
    minFluoride	    number	0	    The minimum amount of fluoride in milligrams the recipe must have.
    maxFluoride	    number	100	    The maximum amount of fluoride in milligrams the recipe can have.
    minSaturatedFat	number	0	    The minimum amount of saturated fat in grams the recipe must have.
    maxSaturatedFat	number	100	    The maximum amount of saturated fat in grams the recipe can have.
    minVitaminA	    number	0	    The minimum amount of Vitamin A in IU the recipe must have.
    maxVitaminA	    number	100	    The maximum amount of Vitamin A in IU the recipe can have.
    minVitaminC	    number	0	    The minimum amount of Vitamin C in milligrams the recipe must have.
    maxVitaminC	    number	100	    The maximum amount of Vitamin C in milligrams the recipe can have.
    minVitaminD	    number	0	    The minimum amount of Vitamin D in micrograms the recipe must have.
    maxVitaminD	    number	100	    The maximum amount of Vitamin D in micrograms the recipe can have.
    minVitaminE	    number	0	    The minimum amount of Vitamin E in milligrams the recipe must have.
    maxVitaminE	    number	100	    The maximum amount of Vitamin E in milligrams the recipe can have.
    minVitaminK	    number	0	    The minimum amount of Vitamin K in micrograms the recipe must have.
    maxVitaminK	    number	100	    The maximum amount of Vitamin K in micrograms the recipe can have.
    minVitaminB1	number	0	    The minimum amount of Vitamin B1 in milligrams the recipe must have.
    maxVitaminB1	number	100	    The maximum amount of Vitamin B1 in milligrams the recipe can have.
    minVitaminB2	number	0	    The minimum amount of Vitamin B2 in milligrams the recipe must have.
    maxVitaminB2	number	100	    The maximum amount of Vitamin B2 in milligrams the recipe can have.
    minVitaminB5	number	0	    The minimum amount of Vitamin B5 in milligrams the recipe must have.
    maxVitaminB5	number	100	    The maximum amount of Vitamin B5 in milligrams the recipe can have.
    minVitaminB3	number	0	    The minimum amount of Vitamin B3 in milligrams the recipe must have.
    maxVitaminB3	number	100	    The maximum amount of Vitamin B3 in milligrams the recipe can have.
    minVitaminB6	number	0	    The minimum amount of Vitamin B6 in milligrams the recipe must have.
    maxVitaminB6	number	100	    The maximum amount of Vitamin B6 in milligrams the recipe can have.
    minVitaminB12	number	0	    The minimum amount of Vitamin B12 in micrograms the recipe must have.
    maxVitaminB12	number	100	    The maximum amount of Vitamin B12 in micrograms the recipe can have.
    minFiber	    number	0	    The minimum amount of fiber in grams the recipe must have.
    maxFiber	    number	100	    The maximum amount of fiber in grams the recipe can have.
    minFolate	    number	0	    The minimum amount of folate in grams the recipe must have.
    maxFolate	    number	100	    The maximum amount of folate in grams the recipe can have.
    minFolicAcid	number	0	    The minimum amount of folic acid in grams the recipe must have.
    maxFolicAcid	number	100	    The maximum amount of folic acid in grams the recipe can have.
    minIodine	    number	0	    The minimum amount of iodine in grams the recipe must have.
    maxIodine	    number	100	    The maximum amount of iodine in grams the recipe can have.
    minIron	        number	0	    The minimum amount of iron in milligrams the recipe must have.
    maxIron	        number	100	    The maximum amount of iron in milligrams the recipe can have.
    minMagnesium	number	0	    The minimum amount of magnesium in milligrams the recipe must have.
    maxMagnesium	number	100	    The maximum amount of magnesium in milligrams the recipe can have.
    minManganese	number	0	    The minimum amount of manganese in milligrams the recipe must have.
    maxManganese	number	100	    The maximum amount of manganese in milligrams the recipe can have.
    minPhosphorus	number	0	    The minimum amount of phosphorus in milligrams the recipe must have.
    maxPhosphorus	number	100	    The maximum amount of phosphorus in milligrams the recipe can have.
    minPotassium	number	0	    The minimum amount of potassium in milligrams the recipe must have.
    maxPotassium	number	100	    The maximum amount of potassium in milligrams the recipe can have.
    minSelenium	    number	0	    The minimum amount of selenium in grams the recipe must have.
    maxSelenium	    number	100	    The maximum amount of selenium in grams the recipe can have.
    minSodium	    number	0	    The minimum amount of sodium in milligrams the recipe must have.
    maxSodium	    number	100	    The maximum amount of sodium in milligrams the recipe can have.
    minSugar	    number	0	    The minimum amount of sugar in grams the recipe must have.
    maxSugar	    number	100	    The maximum amount of sugar in grams the recipe can have.
    minZinc	        number	0	    The minimum amount of zinc in milligrams the recipe must have.
    maxZinc	        number	100	    The maximum amount of zinc in milligrams the recipe can have.
    offset	        number	0	    The number of results to skip (between 0 and 900).
    number	        number	10	    The number of expected results (between 1 and 100).
    random	        boolean	false	If true, every request will give you a random set of recipes within the requested limits.
    limitLicense	boolean	true	Whether the recipes should have an open license that allows display with proper attribution.
    */

    const spoon_URL = "https://api.spoonacular.com/recipes/findByNutrients";
    
    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })

}

function GetRecipesByIngredients(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	        Type	Example	            Description
    ingredients	    string	apples,flour,sugar	A comma-separated list of ingredients that the recipes should contain.
    number	        number	10	                The maximum number of recipes to return (between 1 and 100). Defaults to 10.
    limitLicense	boolean	true	            Whether the recipes should have an open license that allows display with proper attribution.
    ranking	        number	1	                Whether to maximize used ingredients (1) or minimize missing ingredients (2) first.
    ignorePantry	boolean	true	            Whether to ignore typical pantry items, such as water, salt, flour, etc.
    */

    const spoon_URL = "https://api.spoonacular.com/recipes/findByIngredients";
    
    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })
}

function GetRecipeByID(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	            Type	Example	Description
    id	                number	716429	The id of the recipe.
    includeNutrition	boolean	false	Include nutrition data in the recipe information. Nutrition data is per serving. If you want the nutrition data for the entire recipe, just multiply by the number of servings.
    */

    const spoon_URL = `https://api.spoonacular.com/recipes/${parameters.id}/information`;
    delete parameters.id;

    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })

}

function GetRecipeByIDs(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	            Type	Example	        Description
    ids	                string	715538,716429	A comma-separated list of recipe ids.
    includeNutrition	boolean	false	        Include nutrition data to the recipe information. Nutrition data is per serving. If you want the nutrition data for the entire recipe, just multiply by the number of servings.
    */

    const spoon_URL = "https://api.spoonacular.com/recipes/informationBulk";
    
    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })

}

function GetSimilarRecipes(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	        Type	Example	Description
    id	            number	715538	The id of the source recipe for which similar recipes should be found.
    number	        number	1	    The number of random recipes to be returned (between 1 and 100).
    limitLicense	boolean	true	Whether the recipes should have an open license that allows display with proper attribution.
    */

    const spoon_URL = `https://api.spoonacular.com/recipes/${parameters.id}/similar`;
    delete parameters.id;

    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })

}

function GetRandomRecipes(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name	        Type	Example	            Description
    limitLicense	boolean	true	            Whether the recipes should have an open license that allows display with proper attribution.
    tags	        string	vegetarian, dessert	The tags (can be diets, meal types, cuisines, or intolerances) that the recipe must have.
    number	        number	1	                The number of random recipes to be returned (between 1 and 100).
    */

    const spoon_URL = "https://api.spoonacular.com/recipes/random";

    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, parameters);

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request.recipes);
    })

}

function GetRecipeEquipment(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name    Type	Example	    Description
    id	    number	1003464	    The recipe id.
    */

    const spoon_URL = `https://api.spoonacular.com/recipes/${parameters.id}/equipmentWidget.json`;

    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, {});

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request.equipment);
    })

}

function GetRecipeIngredients(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name    Type	Example	    Description
    id	    number	1003464	    The recipe id.
    */

    const spoon_URL = `https://api.spoonacular.com/recipes/${parameters.id}/ingredientWidget.json`;

    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, {});

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request.ingredients);
    })
}

function GetRecipeSummary(ReferenceFunction, parameters = {}) {
    /*
    Parameters
    Name    Type	Example	    Description
    id	    number	4632	    The recipe id.
    */

    const spoon_URL = `https://api.spoonacular.com/recipes/${parameters.id}/summary`;

    let queryURL = URLConstruct(spoon_URL, API_authorization_spoon, {});

    fetch(queryURL)
    .then(response => {
        return response.json();
    })
    .then(request => {
        ReferenceFunction(request);
    })
}

