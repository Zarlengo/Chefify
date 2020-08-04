let all_recipe_object = [];
let added_Ingredients = [];
let excluded_Ingredients = [];
let ids_array = [];
let unsorted_array = [];
let sorted = [];
var li_b;
var b;
let groupIds = [];
const intolerance_names = [];
const restrictions_names = [];
let intolerances_array = [];
let restrictions_array = [];
let user_intolerances_names = [];
let user_restrictions_names = [];
var queryKeyword;
var user_i_string, user_r_string;

// Function to dynamically create a recipe card
function makeRecipeCard(array_of_recipe_objects) {
    addToStorage(array_of_recipe_objects);

    let recipe_container = document.querySelector("#recipe_container");

    // Cycles through each recipe in the array
    for (let recipe_index = 0; recipe_index < array_of_recipe_objects.length; recipe_index++) {

        // Creates a new container element for each recipe
        let recipe = array_of_recipe_objects[recipe_index];
        let recipe_div = document.createElement("div");
        recipe_div.setAttribute("data-id", recipe.id);
        recipe_div.setAttribute("class", "card");
        recipe_div.addEventListener("click", openDetailedRecipe, false);

        // Creates title bar for the card
        let title_head = document.createElement("div");
        title_head.setAttribute("class", "card_head");
        let title = document.createElement("h2");
        title.setAttribute("class", "card_title");
        title.textContent = recipe.title;
        title_head.append(title);
        recipe_div.append(title_head);

        // Adds the recipe image
        if (typeof(recipe.imageType) != "undefined") {
            let image = document.createElement("img");
            image.setAttribute("src", SpoonImageURL(recipe.id, recipe.imageType, "636x393", "recipeImages"));
            image.setAttribute("class", "recipe_image");
            image.setAttribute("alt", recipe.title);
            recipe_div.append(image);
        }

        // Adds the score as a X of 5 star rating
        recipe_div.append(makeStarDiv(recipe.spoonacularScore));

        // Adds the ready in X minutes
        let ready_time = document.createElement("div");
        ready_time.setAttribute("class", "ready_time");
        ready_time.textContent = `Time until ready: ${recipe.readyInMinutes} minutes`;
        recipe_div.append(ready_time);

        // Adds the recipe summary in html format
        let summary = document.createElement("p");
        summary.setAttribute("class", "recipe_summary");
        summary.innerHTML = trimHTMLString(recipe["summary"]);
        recipe_div.append(summary);

        // Adds the card to the page
        recipe_container.append(recipe_div);
    }
}



// Function to get stars in a "p" element
function makeStarDiv(number) {
    // Calculates the number of stars to show based on the rating
    // Calculated out of 10 stars to get the half to show when reduced to only 5 (9 stars = 4.5)
    let num_of_stars = Math.round(parseInt(number) / 10);
    let decimal_num_stars = Math.round(parseInt(number) / 2) / 10;

    // Creates an element to hold all the star icons
    let star_container = document.createElement("p");
    star_container.setAttribute("class", "score");
    star_container.setAttribute("title", decimal_num_stars);

    // 5 count loop to create full, empty, or half star icon
    for (let star = 2; star <= 10; star += 2) {
        let star_img = document.createElement("i");
        star_img.setAttribute("aria-hidden", "true");
        if (star <= num_of_stars) {
            // Add full star
            star_img.setAttribute("class", "fas fa-star");
        } else if (star - 1 == num_of_stars ) {
            // Add half star
            star_img.setAttribute("class", "fas fa-star-half-alt");
        } else {
            // Add empty star
            star_img.setAttribute("class", "far fa-star");
        }
        star_container.append(star_img);
    }
    return star_container;
}

// Function which checks a string for closed HTML elements and trims the string
function trimHTMLString(string_input) {
    const trim_length = 200;

    // If the string is already smaller than the max length
    if (string_input.length <= trim_length) {
        return string_input;
    }

    // Trims the string
    let trimmed_string = string_input.substring(0, trim_length).trim();

    // Checks if the last character was not a blank space, removes partial words
    if (trimmed_string.length == trim_length) {
        trimmed_string = completeWordsInString(trimmed_string);
    }

    // Function to remove a partial word as the last word in the summary
    function completeWordsInString (string_needing_fixed) {
        let reversed_needing_fix = string_needing_fixed.split("").reverse().join("");
        let last_space = reversed_needing_fix.indexOf(" ");
        if (last_space == -1 || last_space == 0) {
            return string_needing_fixed.trim();
        }
        return trimmed_string.substring(0, reversed_needing_fix.length - last_space).trim();
    }

    // Function to add a "..." to the end of the string to show there is more text available in the detailed section
    function addDotDotDot(final_string) {
        return `${final_string} ...`;
    }

    // Creates a string that is the reverse of the original, used to find last occurrences
    let reversed_string = trimmed_string.split("").reverse().join("");

    // If no HTML elements exist return shortened string
    if (reversed_string.indexOf("<") == -1) {
        return addDotDotDot(trimmed_string);

    // If there is a start element "<", but no finish ">"
    } else if (reversed_string.indexOf(">") == -1) {
        let index = reversed_string.length - reversed_string.indexOf("<");
        return addDotDotDot(trimmed_string.substring(0, index).trim());

    // If the start element "<" is after the last finish element ">"
    } else if (reversed_string.indexOf("<") < reversed_string.indexOf(">")) {
        let index = reversed_string.length - reversed_string.indexOf("<");
        return addDotDotDot(trimmed_string.substring(0, index).trim());
    }

    // Correct HTML syntax, return trimmed string
    // console.log(trimmed_string);
    return addDotDotDot(trimmed_string);
}

function loadFrontPage() {

    // Test mode setup to minimize API calls while in development, loads once and then pulls from local storage on subsequent refreshes
    let current_storage = JSON.parse(localStorage.getItem("recipe_list"));
    if (current_storage == null) {
        GetRandomRecipes(makeRecipeCard, {number: 50});
    }


    let recipe_list = JSON.parse(localStorage.getItem("recipe_list"));
    makeRecipeCard(recipe_list);


}

loadFrontPage();


function openDetailedRecipe(event) {
    let click_id = this.getAttribute("data-id");
    console.log(all_recipe_object.filter(recipe => recipe.id == click_id));

}

function addToStorage(array_of_objects) {

    let current_storage = JSON.parse(localStorage.getItem("recipe_list"));
    
    if (current_storage != null) {
        // If there is an existing entry, adds to this object
        for (let index = 0; index < array_of_objects.length; index++) {
            // Checks if the recipe ID is in local storage
            if (current_storage.filter(recipe => recipe.id == array_of_objects[index].id).length > 0) {
                // Do nothing
            } else {
                current_storage.push(array_of_objects[index]);
            }
        }
        uploadOBJ = current_storage;
    } else {
        // If this is the first entry
        uploadOBJ = array_of_objects;
    }

    // Converts the object to a string and uploads to local storage
    var json_obj = JSON.stringify(uploadOBJ);
    localStorage.setItem("recipe_list", json_obj);
    console.log(uploadOBJ);
}


function setUserSettings() {
    let user_intolerances = JSON.parse(localStorage.getItem("intolerances"));
    let user_restrictions = JSON.parse(localStorage.getItem("restrictions"));
    
    let dietary_intolerances = document.getElementsByClassName("intolerance");
    let dietary_restrictions = document.getElementsByClassName('restriction');
    console.log(dietary_intolerances);
    if (user_intolerances != null ||  user_intolerances != undefined) {
        for (i = 0; i < dietary_intolerances.length; i++) {
            dietary_intolerances[i].childNodes[1].checked = user_intolerances[i];
        }
    }   
    if (user_restrictions != null ||  user_restrictions != undefined) {
        for (i = 0; i < dietary_restrictions.length; i++) {
            dietary_restrictions[i].childNodes[1].checked = user_restrictions[i];
        }
    }
}

setUserSettings();

function getUserSettings() {
    let dietary_intolerances = document.getElementsByClassName("intolerance");
    let dietary_restrictions = document.getElementsByClassName('restriction');
    
    if (dietary_intolerances != null ||  dietary_intolerances != undefined) {
        for (i = 0; i < dietary_intolerances.length; i++) {
            if (dietary_intolerances[i].childNodes[1].checked == true) {
                user_intolerances_names.push(dietary_intolerances[i].childNodes[5].innerHTML);
            }
        }
    }   
    if (dietary_restrictions != null ||  dietary_restrictions != undefined) {
        for (i = 0; i < dietary_restrictions.length; i++) {
            if (dietary_restrictions[i].childNodes[1].checked == true) {
                user_restrictions_names.push(dietary_restrictions[i].childNodes[5].innerHTML);
            }
        }
        user_i_string = user_intolerances_names.join(",");
        user_r_string = user_restrictions_names.join(",");
        console.log(user_i_string);
        console.log(user_r_string);
    }
    return user_i_string, user_r_string;
}

function filterResults(type) {
    let filter_recipes = document.querySelectorAll(".card");
    switch(type) {
        case "price":
            console.log("price")
            break;
        case "rating":
            console.log("rating");
            for (i = 0; i < filter_recipes.length; i++) {
                let rId = filter_recipes[i].dataset.id;
                let rating = filter_recipes[i].children[2].title; 
                unsorted_array[i] = [rId, parseFloat(rating)];
            }
            let sorted_array = unsorted_array.sort(sortArray);
            function sortArray(a, b) {
                if (a[1] === b[1]) {
                    return 0;
                }
                else {
                    return (a[1] < b[1]) ? -1 : 1;
                }
            }   
            
            for (i = 0; i < sorted_array.length; i++) {
                groupIds.push(sorted_array[i][0]);
            }

            groupIds.reverse();
            let newids = groupIds.join(",");
            let recipe_container = document.querySelector("#recipe_container");
            recipe_container.textContent = '';        
            GetRecipeByIDs(makeRecipeCard, {ids: newids});
            break;
        case "time":
            console.log("time");
            break;
    }
}

function refineSearch() {
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: flex;");
    document.querySelector(".search-parameters").setAttribute("style", "display: none;");
}

function refineMainSearch() {
    document.querySelector(".search").setAttribute("style", "display: flex;");
    document.querySelector(".search-parameters").setAttribute("style", "display: none;");
}

function removeAddedIngredient(data) {
    let delete_ing = document.querySelector(".added-ingredients");
    let delete_ing_child = document.querySelector("#aIngredient-"+data.target.attributes[1].nodeValue);
    added_Ingredients.splice(data.target.attributes[1].nodeValue);
    delete_ing.removeChild(delete_ing_child);
}

function removeExcludedIngredient(data) {
    let delete_ing = document.querySelector(".excluded-ingredients");
    let delete_ing_child = document.querySelector("#eIngredient-"+data.target.attributes[1].nodeValue);
    excluded_Ingredients.splice(data.target.attributes[1].nodeValue);
    delete_ing.removeChild(delete_ing_child);

}

function addedIngredients(add) {
    let added_ingredients = document.querySelector(".added-ingredients");
    added_ingredients.textContent = '';
    added_Ingredients.push(add);
    for (i = 0; i < added_Ingredients.length; i++) {
        var li = document.createElement("p");
        li_b = document.createElement("button");
        li_b.setAttribute('class', 'remove-ai');
        li_b.setAttribute('id', i);
        li_b_text = document.createTextNode("x");
        var li_text = document.createTextNode(added_Ingredients[i]);
        li.appendChild(li_text);
        li_b.appendChild(li_b_text);
        li.appendChild(li_b);
        li.setAttribute('class', 'aIngredients')
        li.setAttribute('id', 'aIngredient-'+i);
        li.setAttribute('value', added_Ingredients[i]);
        var element = document.querySelector(".added-ingredients");
        element.appendChild(li);
        li_b.addEventListener("click", removeAddedIngredient);
    }
}

function excludedIngredients(exclude) {
    console.log(exclude);
    let excluded_ingredients = document.querySelector(".excluded-ingredients");
    excluded_ingredients.textContent = '';
    excluded_Ingredients.push(exclude);
    for (i = 0; i < excluded_Ingredients.length; i++) {
        var li = document.createElement("p");
        b = document.createElement("button");
        b.setAttribute('class', 'remove-ei');
        // b.className = "remove-ei"
        b.setAttribute('id', i);
        b_text = document.createTextNode("x");
        var li_text = document.createTextNode(excluded_Ingredients[i]);
        li.appendChild(li_text);
        b.appendChild(b_text);
        li.appendChild(b);
        li.setAttribute('class', 'eIngredients')
        li.setAttribute('id', 'eIngredient-'+i);
        li.setAttribute('value', excluded_Ingredients[i]);
        var element = document.querySelector(".excluded-ingredients");
        element.appendChild(li);
        b.addEventListener("click", removeExcludedIngredient);
    }
}

function displayComplexSearchParameters() {
    let search_parameters = document.querySelector(".search-parameters");
    if (search_parameters.querySelector(".search-results")) {
        let sp_child = document.querySelector(".search-results");
        let sp_button = document.querySelector(".refine-main-search");
        search_parameters.removeChild(sp_child);
        search_parameters.removeChild(sp_button);
    }
    // let add_ingredients = added_Ingredients.join(",");
    // let exx_ingredients = excluded_Ingredients.join(",");
    // console.log(add_ingredients);
    var keyword = document.querySelector("#search-recipe").value;
    var p = document.createElement("p");
    var b = document.createElement("button");
    p.setAttribute('class', 'search-results');
    b.setAttribute('class', 'refine-main-search');
    // p.className = "search-results";
    // b.className = "refine-main-search";
    b.onclick = refineMainSearch;
    var p_text = document.createTextNode("You searched for: " +  keyword);
    // if (keyword != "") {
    //     var p_text = document.createTextNode("Your searched for: " + keyword + ".");
    // }
    // if (added_Ingredients != "") {
    //     p_text.append("Included ingredients: " + added_Ingredients);
    // }
    // var p_text = document.createTextNode("Your searched for: " + keyword + ".Ingredients included:" + added_Ingredients + "");
    var b_text = document.createTextNode("Refine search");
    b.appendChild(b_text);
    p.appendChild(p_text);
    search_parameters.appendChild(p);
    search_parameters.appendChild(b);
    document.querySelector(".search").setAttribute("style", "display: none;");
    document.querySelector(".search-parameters").setAttribute("style", "display: flex;");
}

function displaySearchParameters() {
    let search_parameters = document.querySelector(".search-parameters");
    if (search_parameters.querySelector(".search-results")) {
        let sp_child = document.querySelector(".search-results");
        let sp_button = document.querySelector(".refine");
        search_parameters.removeChild(sp_child);
        search_parameters.removeChild(sp_button);
    }
    let add_ingredients = added_Ingredients.join(",");
    console.log(add_ingredients);
    var p = document.createElement("p");
    var b = document.createElement("button");
    p.setAttribute('class', 'search-results');
    b.setAttribute('class', 'refine');
    // p.className = "search-results";
    // b.className = "refine";
    b.onclick = refineSearch;
    var p_text = document.createTextNode("You ingredients included: " + add_ingredients);
    var b_text = document.createTextNode("Refine search");
    b.appendChild(b_text);
    p.appendChild(p_text);
    search_parameters.appendChild(p);
    search_parameters.appendChild(b);
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: none;");
    document.querySelector(".search-parameters").setAttribute("style", "display: flex;");
}

function recipesIDs(ids) {
    // recipe_by_ingredients = JSON.parse(localStorage.getItem("recipe_list"));
    ids_array = [];
    console.log(ids);
    for (i = 0; i < ids.length; i++) {
        ids_array.push(ids[i].id);
    }

    let ids_string = ids_array.join(",");
    ids_string = ids_string.toString();
    console.log(ids_string);
    // console.log(ids_array);
    localStorage.removeItem("recipe_list");
    let recipe_container = document.querySelector("#recipe_container");
    recipe_container.textContent = '';
    localStorage.removeItem("recipe_list");
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 50});
    displaySearchParameters();
}

function complexRecipeIDs(ids) {
    // recipe_by_ingredients = JSON.parse(localStorage.getItem("recipe_list"));
    ids_array = [];
    console.log(ids);
    for (i = 0; i < ids.length; i++) {
        ids_array.push(ids[i].id);
    }

    let ids_string = ids_array.join(",");
    ids_string = ids_string.toString();
    console.log(ids_string);
    localStorage.removeItem("recipe_list");
    let recipe_container = document.querySelector("#recipe_container");
    recipe_container.textContent = '';
    localStorage.removeItem("recipe_list");
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 50});
    displayComplexSearchParameters();
}

function browseRecipeIDs(ids) {
    ids_array = [];
    console.log(ids);
    for (i = 0; i < ids.length; i++) {
        ids_array.push(ids[i].id);
    }

    let ids_string = ids_array.join(",");
    ids_string = ids_string.toString();
    console.log(ids_string);
    // console.log(ids_array);
    localStorage.removeItem("recipe_list");
    let recipe_container = document.querySelector("#recipe_container");
    recipe_container.textContent = '';
    localStorage.removeItem("recipe_list");
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 50});
}


document.querySelector(".search-ingredient").addEventListener("click", function() {
    document.querySelector(".search").setAttribute("style", "display: none;");
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: flex;");
});

document.querySelector(".add-ingredient-button").addEventListener("click", function() {
    var ingredient = document.querySelector("#sec-search-add-ingredient").value;
    var exingredient = document.querySelector("#sec-search-exclude-ingredient").value;
    // if ((ingredient == null || ingredient == undefined || ingredient == "") && (exingredient == null || exingredient == undefined || exingredient == "")) {
    //     // do nothing
    // } else if (ingredient == null || ingredient == undefined || ingredient == "") {
    //     excludedIngredients(exingredient);
    // } else if (exingredient == null || exingredient == undefined || exingredient == "") {
    //     addedIngredients(ingredient)
    // } else {
    //     excludedIngredients(exingredient);
    //     addedIngredients(ingredient)
    // }
    addedIngredients(ingredient);
});

document.querySelector(".exclude-ingredient-button").addEventListener("click", function() {
    var ingredient = document.querySelector("#sec-search-exclude-ingredient").value;
    excludedIngredients(ingredient);
});

document.querySelector("#exit-ingredient-search").addEventListener("click", function() {
    document.querySelector(".search").setAttribute("style", "display: flex;");
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: none;");
});

document.querySelector(".submit-ingredient-search").addEventListener("click", function() {
    var ingredientsList = added_Ingredients.join(",");
    var exc_ingredients = excluded_Ingredients.join(',');
    var key = document.querySelector("#sec-search-keyword").value;
    let intol, udiet = getUserSettings();
    let param = {"includeIngredients": ingredientsList, "excludedIngredients": exc_ingredients, "query": key, "intolerances": intol, "diet": udiet, "number":50};
    // let var1, var2 = getUserSettings();
    if ((ingredientsList == null || ingredientsList == undefined || ingredientsList == "")) {
        delete param.includeIngredients;
    } else {
        // do nothing
    }
    if ((intol == null || intol == undefined || intol == "")) {
        delete param.intol;
    } else {
        // do nothing
    }
    if ((udiet == null || udiet == undefined || udiet == "")) {
        delete param.udiet;
    } else {
        // do nothing
    }

    if (exc_ingredients == null || exc_ingredients == undefined || exc_ingredients == "") {
        delete param.excludedIngredients;
    } else {
        // do nothing
    }
    if (key == null || key == undefined || key == "") {
        delete param.query;
    } else {
        // do nothing
    }
    let var1, var2 = getUserSettings();
    console.log(var1);
    console.log(var2);
    console.log(param);
    
    // for (i = 0; i < param.length; i++) {
    //     jparam = jparam + param[i].includeIngredients; 
    // }
    // // jparam = param.join("}");
    // console.log(jparam);

    localStorage.removeItem("recipe_list")   
    GetRecipesComplex(recipesIDs, param);
    // }
    
});

document.querySelector(".sf-dropdown-content").addEventListener("click", function(data) {
    let filter_type = data.target.id;
    filterResults(filter_type);
});

document.querySelector(".search-recipe-button").addEventListener("click", function () {
    var keyword = document.querySelector("#search-recipe").value;
    console.log(keyword);
    if ((keyword == null || keyword == undefined || keyword == "")) {
        // do nothing
    } else {
        let recipe_container = document.querySelector("#recipe_container");
        recipe_container.textContent = '';   
        localStorage.removeItem("recipe_list");   
        GetRecipesComplex(complexRecipeIDs, {query: keyword, number:50});
    }
});

document.querySelector(".settings-save-button").addEventListener("click", function(data) {
    console.log(data);
    let dietary_intolerances = document.getElementsByClassName("intolerance");
    let dietary_restrictions = document.getElementsByClassName('restriction');
    console.log(dietary_intolerances);
    for (i = 0; i < dietary_intolerances.length; i++) {
        let dietary_intolerance = dietary_intolerances[i].childNodes[1].checked;
        intolerances_array.push(dietary_intolerance);
    }

    for (i = 0; i < dietary_restrictions.length; i++) {
        let dietary_restriction = dietary_restrictions[i].childNodes[1].checked;
        restrictions_array.push(dietary_restriction);
    }

    var json_obj = JSON.stringify(intolerances_array);
    localStorage.setItem("intolerances", json_obj);

    var json_obj1 = JSON.stringify(intolerances_array);
    localStorage.setItem("restrictions", json_obj1);
});

document.querySelector("#meal-type").addEventListener("click", function(data) {
    let meal_type = data.target.innerHTML;
    GetRecipesComplex(browseRecipeIDs, {type: meal_type, number:50});
});

document.querySelector("#diets").addEventListener("click", function(data) {
    console.log(data);
    let diet = data.target.innerHTML;
    console.log(diet);
    GetRecipesComplex(browseRecipeIDs, {diet: diet, number:50});
});

document.querySelector("#cuisines").addEventListener("click", function(data) {
    let cuisine = data.target.innerHTML;
    GetRecipesComplex(browseRecipeIDs, {cuisine: cuisine, number: 50});
});

document.querySelector("#others").addEventListener("click", function(data) {
    let other = data.target.id;
    console.log(other);
    var type;
    switch(other) {
        case 'time':
            type = "maxReadyTime:"+30;
            break;
        case "carbs":
            type = "maxCarbs:"+20;
            break;
        case "fat":
            type = "maxFat:"+20;
            break;
        case "calorie":
            type = "maxCalories:"+400;
            break;
        case "cholesterol":
            type = "maxCholesterol:"+30;
            break;
        case "sugar":
            type = "maxSugar:"+20;
            break;
        case "protein":
            type = "minProtein:"+50;
            break;
        case "calcium":
            type = "minCalcium:"+50;
            break;
        case "fiber":
            type = "minFiber:"+50;
            break;
    }
    console.log(type);
    GetRecipesComplex(complexRecipeIDs, {type, number:50});
});

document.querySelector("#user_settings").addEventListener("click", function() {
    setUserSettings();
    document.querySelector("#settings-modal").setAttribute("style", "display: flex;");
    document.querySelector("#recipe_container").setAttribute("style", "display: none;");
    document.querySelector(".search").setAttribute("style", "display: none;");
});

document.querySelector(".close-settings").addEventListener("click", function() {
    document.querySelector("#settings-modal").setAttribute("style", "display: none;");
    document.querySelector("#recipe_container").setAttribute("style", "display: flex;");
    document.querySelector(".search").setAttribute("style", "display: flex;");
});

