let all_recipe_object = [];
let added_Ingredients = [];
let excluded_Ingredients = [];
let ids_array = [];

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

function addedIngredients(add) {
    // console.log(add);
    let added_ingredients = document.querySelector(".added-ingredients");
    added_ingredients.textContent = '';
    added_Ingredients.push(add);
    for (i = 0; i < added_Ingredients.length; i++) {
        var li = document.createElement("button");
        var li_exit = " x";
        var li_text = document.createTextNode(added_Ingredients[i]+li_exit)
        li.appendChild(li_text);
        li.setAttribute('id', 'aIngredient-'+i);
        li.setAttribute('value', added_Ingredients[i]);
        // li.setAttribute('text', added_Ingredients[i]);
        var element = document.querySelector(".added-ingredients");
        element.appendChild(li);
    }
}

function excludedIngredients(exclude) {
    console.log(exclude);
    let excluded_ingredients = document.querySelector(".excluded-ingredients");
    excluded_ingredients.textContent = '';
    excluded_Ingredients.push(exclude);
    for (i = 0; i < excluded_Ingredients.length; i++) {
        var li = document.createElement("button");
        var li_exit = " x"
        var li_text = document.createTextNode(excluded_Ingredients[i]+li_exit);
        li.appendChild(li_text);
        li.setAttribute('id', 'eIngredient-'+i);
        li.setAttribute('value', excluded_Ingredients[i]);
        // li.setAttribute('text', added_Ingredients[i]);
        var element = document.querySelector(".excluded-ingredients");
        element.appendChild(li);
    }
}

// function recipeOutput(input) {
//     console.log(input);
// }
function displaySearchParameters() {
    let search_parameters = document.querySelector(".search-parameters");
    let add_ingredients = added_Ingredients.join(",");
    console.log(add_ingredients);
    var p = document.createElement("p");
    var p_text = document.createTextNode("Your ingredients include: " + add_ingredients);
    p.appendChild(p_text);
    search_parameters.appendChild(p);
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: none;");
}

function recipesIDs(ids) {
    // recipe_by_ingredients = JSON.parse(localStorage.getItem("recipe_list"));
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
    GetRecipeByIDs(makeRecipeCard, {ids: ids_string, number: 10});
    displaySearchParameters();
}

document.querySelector(".search-ingredient").addEventListener("click", function() {
    document.querySelector(".search").setAttribute("style", "display: none;");
    document.querySelector(".sec-search-ingredients").setAttribute("style", "display: flex;");
});

document.querySelector(".add-ingredient-button").addEventListener("click", function() {
    var ingredient = document.querySelector("#sec-search-add-ingredient").value;
    // console.log(ingredient);
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
    var ingredients = added_Ingredients.join(",");
    GetRecipesByIngredients(recipesIDs, {ingredients: ingredients, number:50});
});


// $(document).ready(function() {

//     function addedIngredients(add) {
//         $(".added-ingredients").empty();
//         added_Ingredients.push(add);
//         for (i = 0; i < added_Ingredients.length; i++) {
//             var li = $("<p>");
//             li.attr('id', "aIngredient-"+i);
//             li.attr('value', added_Ingredients[i]);
//             li.text(added_Ingredients[i]);
//             $(".added-ingredients").append(li);
//             console.log(li);
//         }
//         console.log(li);
//     }

//     function excludedIngredients(exclude) {
//         $(".excluded-ingredients").empty();
//         excluded_Ingredients.push(exclude);
//         for (i = 0; i < excluded_Ingredients.length; i++) {
//             var li = $("<p>");
//             // li.addClass("exclude-ing");
//             li.attr('id', "eIngredient-"+i);
//             li.attr('value', excluded_Ingredients[i]);
//             li.text(excluded_Ingredients[i]);
//             $(".excluded-ingredients").append(li);
//         }
//         console.log(li);
//     }

//     function recipesIDs() {
//         recipe_by_ingredients = JSON.parse(localStorage.getItem("recipe_list"));
//         console.log(recipe_by_ingredients);

//         for (i = 0; i < recipe_by_ingredients.length; i++) {
//             ids_array.push(recipe_by_ingredients[i].id);
//         }
//         console.log(ids_array);
//     }

    

//     $(".search-ingredient").on("click", function() {
//         $(".search").css("display","none");
//         $(".sec-search-ingredients").css("display","flex");
//     });

//     $(".add-ingredient-button").on("click", function() {
//         var ingredient = $("#sec-search-add-ingredient").val();
//         addedIngredients(ingredient);
//     });

//     $(".exclude-ingredient-button").on("click", function() {
//         var ingredient = $("#sec-search-exclude-ingredient").val();
//         excludedIngredients(ingredient);
//         $("#sec-search-exclude-ingredients").css("display","block")
//     });

//     $("#exit-ingredient-search").on("click", function() {
//         $(".sec-search-ingredients").css("display","none");
//         $(".search").css("display","flex");
//     });

//     $(".submit-ingredient-search").on("click", function() {
//         // localStorage.removeItem("recipe_list");
//         GetRecipesByIngredients(addToStorage, {ingredients: "apple", number:10});

//         recipesIDs();
//     });


// });
// search_ingredient = document.querySelector(".search-ingredient");
// add_ingredient_button = document.querySelector(".search-ingredient");
// search_ingredient = document.querySelector(".search-ingredient");
// search_ingredient = document.querySelector(".search-ingredient");
// search_ingredient = document.querySelector(".search-ingredient");

// document.querySelector(".search-ingredient").addEventListener("click", function() {
//     document.querySelector(".search").setAttribute("style", "display=none");
//     document.querySelector(".sec-search-ingredients").setAttribute("style", "display=flex");
// });

// document.querySelector(".add-ingredient-button").addEventListener("click", function() {
//     var ingredient = document.querySelector("#sec-search-add-ingredient").innerHTML;
//     addedIngredients(ingredient);

// });

// document.querySelector(".exclude-ingredient-button").addEventListener("click", function() {
//     var ingredient = document.querySelector("#sec-search-exclude-ingredient").innerHTML;
//     excludedIngredients(ingredient);
// });

// document.querySelector("#exit-ingredient-search").addEventListener("click", function() {
//     document.querySelector(".search").setAttribute("style", "display=flex");
//     document.querySelector(".sec-search-ingredients").setAttribute("style", "display=none");
// });

// document.querySelector(".submit-ingredient-search").addEventListener("click", function() {
//     localStorage.removeItem("recipe_list");
//     GetRecipesByIngredients(addToStorage, {ingredients: "apple", number:10});
// });