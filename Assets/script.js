let all_recipe_object = [];
let recipe_container = document.querySelector("#recipe_container");
let shopping_aisles = [ "Baking",
                        "Health Foods",
                        "Spices and Seasonings",
                        "Pasta and Rice",
                        "Bakery/Bread",
                        "Refrigerated",
                        "Canned and Jarred",
                        "Frozen",
                        "Nut butters, Jams, and Honey",
                        "Oil, Vinegar, Salad Dressing",
                        "Condiments",
                        "Savory Snacks",
                        "Milk, Eggs, Other Dairy",
                        "Ethnic Foods",
                        "Tea and Coffee",
                        "Meat",
                        "Gourmet",
                        "Sweet Snacks",
                        "Gluten Free",
                        "Alcoholic Beverages",
                        "Cereal",
                        "Nuts",
                        "Beverages",
                        "Produce",
                        "Not in Grocery Store/Homemade",
                        "Seafood",
                        "Cheese",
                        "Dried Fruits",
                        "Online",
                        "Grilling Supplies",
                        "Bread"];

// Function to dynamically create a recipe card
function makeRecipeCard(array_of_recipe_objects) {
    scroll(0,0);
    recipe_container.innerHTML = "";
    addToStorage(array_of_recipe_objects);

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
            image.setAttribute("class", "card_image");
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
    } else {


																	  
								

        let recipe_list = JSON.parse(localStorage.getItem("recipe_list"));
        makeRecipeCard(recipe_list);
    }

}

loadFrontPage();


function openDetailedRecipe () {
    scroll(0,0);
    let click_id = this.getAttribute("data-id");
    let recipe_objs = all_recipe_object.filter(recipe => recipe.id == click_id);
    let recipe = recipe_objs[0];
    recipe_container.innerHTML = "";

    console.log(recipe);

    // Creates summary section
    let summary_section = document.createElement("section");
    summary_section.setAttribute("class", "recipe-summary");

    // Creates header for the recipe
    let section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    section_head.setAttribute("data-id", recipe.id);
    let title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = recipe.title;
    section_head.append(title);
    summary_section.append(section_head);


    // Adds the recipe image
    if (typeof(recipe.imageType) != "undefined") {
        let image = document.createElement("img");
        image.setAttribute("src", SpoonImageURL(recipe.id, recipe.imageType, "636x393", "recipeImages"));
        image.setAttribute("class", "recipe_image");
        image.setAttribute("alt", recipe.title);
        summary_section.append(image);
    }

    // Adds the score as a X of 5 star rating
    summary_section.append(makeStarDiv(recipe.spoonacularScore));

    // Adds the ready in X minutes
    let ready_time = document.createElement("div");
    ready_time.setAttribute("class", "ready_time");
    ready_time.textContent = `Time until ready: ${recipe.readyInMinutes} minutes`;
    summary_section.append(ready_time);

    summary_section.append(document.createElement("br"));

    // Adds the recipe summary in html format
    let summary = document.createElement("p");
    summary.setAttribute("class", "recipe_summary");
    summary.innerHTML = recipe["summary"];
    summary_section.append(summary);

    // Adds the summary section to the recipe page
    recipe_container.append(summary_section);


    // Creates ingredient section
    let ingredient_section = document.createElement("section");
    ingredient_section.setAttribute("class", "recipe-ingredients");

    // Creates header for the ingredient
    section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = "Ingredients:";
    section_head.append(title);


    let button_div = document.createElement("div");
    button_div.setAttribute("class", "button-div");

    let button_US = document.createElement("button");
    button_US.setAttribute("id", "btn-US");
    button_US.setAttribute("class", "btn-unit selected");
    button_US.textContent = "US";
    button_US.addEventListener("click", unitToggle, false);
    button_div.append(button_US);

    let button_metric = document.createElement("button");
    button_metric.setAttribute("id", "btn-metric");
    button_metric.setAttribute("class", "btn-unit");
    button_metric.textContent = "METRIC";
    button_metric.addEventListener("click", unitToggle, false);
    button_div.append(button_metric);

    section_head.append(button_div);
    ingredient_section.append(section_head);


    // Adds the ingredients
    let extended_ingredients = recipe.extendedIngredients;
    extended_ingredients.sort((a, b) => (a.aisle > b.aisle) ? 1 : -1);
    let current_aisle = "";
    let row_obj;
    for (let index = 0; index < extended_ingredients.length; index++) {
        current_ingredient = extended_ingredients[index];

        let new_li = document.createElement("li");
        new_li.setAttribute("class", "ingredient_item");
        new_li.setAttribute("data-id", current_ingredient.id);

        let input = document.createElement("input");
        input.setAttribute("class", "ingredient-input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("value", "");
        input.setAttribute("id", current_ingredient.id);
        new_li.append(input);

        let US = current_ingredient.measures.us;
        let US_text = document.createElement("label");
        US_text.setAttribute("class", "US ingredient-label")
        US_text.setAttribute("for", current_ingredient.id);
        US_text.textContent = ` ${US.amount} ${US.unitShort} ${current_ingredient.name}`;
        new_li.append(US_text);

        let metric = current_ingredient.measures.metric;
        let metric_text = document.createElement("label");
        metric_text.setAttribute("class", "metric ingredient-label")
        metric_text.setAttribute("for", current_ingredient.id);
        metric_text.textContent = ` ${metric.amount} ${metric.unitShort} ${current_ingredient.name}`;
        new_li.append(metric_text);

        if (current_aisle == current_ingredient.aisle) {
            // Add to current row
            row_obj.append(new_li);
        } else {
            // Make a new row
            if (current_aisle != "") {
                ingredient_section.append(row_obj);
            }
            current_aisle = current_ingredient.aisle;
            row_obj = document.createElement("ul");
            row_obj.setAttribute("class", "aisle");
            row_title = document.createElement("h3");
            row_title.setAttribute("class", "aisle-title");
            row_title.textContent = current_aisle;
            row_obj.append(row_title);
            row_obj.append(new_li);
        }
    }
    ingredient_section.append(row_obj);
    recipe_container.append(ingredient_section);


    let text_instructions = false;
    let graphic_instructions = false;
    if (recipe.analyzedInstructions.length > 0) {
        graphic_instructions = true;
    }

    if (recipe.instructions != "") {
        text_instructions = true;
    }

    if (!text_instructions && !graphic_instructions) {
        // No instructions available
        return;
    }
    // Creates instructions section
    let instruction_section = document.createElement("section");
    instruction_section.setAttribute("class", "recipe-instructions");

    // Creates header for the ingredient
    section_head = document.createElement("div");
    section_head.setAttribute("class", "section-head");
    title = document.createElement("h2");
    title.setAttribute("class", "section-title");
    title.textContent = "Instructions:";
    section_head.append(title);

    button_div = document.createElement("div");
    button_div.setAttribute("class", "button-div");

    if (graphic_instructions) {
        let button_graphics = document.createElement("button");
        button_graphics.setAttribute("id", "btn-graphics");
        button_graphics.setAttribute("class", "btn-instructions selected");
        button_graphics.textContent = "Graphics";
        button_graphics.addEventListener("click", instructionToggle, false);
        button_div.append(button_graphics);
    }

    if (text_instructions) {
        let button_text = document.createElement("button");
        button_text.setAttribute("id", "btn-text");
        button_text.setAttribute("class", "btn-instructions ");
        button_text.textContent = "Text";
        button_text.addEventListener("click", instructionToggle, false);
        button_div.append(button_text);
    }

    section_head.append(button_div);
    instruction_section.append(section_head);

    if (text_instructions) {
        let instruction_text = document.createElement("article");
        instruction_text.setAttribute("class", "instruction_text");
        instruction_text.innerHTML = recipe["instructions"];
        instruction_section.append(instruction_text);
    }

    if (graphic_instructions) {
        let detailed_instructions = recipe.analyzedInstructions[0].steps;
        let instruction_graphics = document.createElement("article");
        instruction_graphics.setAttribute("class", "instruction_graphics");
        for (let step = 0; step < detailed_instructions.length; step++) {
            let step_obj = detailed_instructions[step];
            // console.log(detailed_instructions[step]);
            let step_id = document.createElement("div");
            step_id.setAttribute("class", "step");

            let step_title = document.createElement("h3");
            step_title.setAttribute("class", "step-title");
            if (typeof(step_obj.length) != "undefined") {
                step_title.textContent = `Step ${step_obj.number}: ${step_obj.length.number} ${step_obj.length.unit}`;
            } else {
                step_title.textContent = `Step ${step_obj.number}`;
            }
            step_id.append(step_title);

            let step_instruction = document.createElement("div");
            step_instruction.setAttribute("class", "step-instruction");
            step_instruction.textContent = step_obj.step;
            step_id.append(step_instruction);

            if (step_obj.ingredients.length > 0) {
                let step_ingredient = document.createElement("div");
                step_ingredient.setAttribute("class", "step-figures");
                for (ingredient = 0; ingredient < step_obj.ingredients.length; ingredient++) {
                    if (step_obj.ingredients[ingredient].image != "") {
                        let ingredient_figure = document.createElement("figure");

                        let ingredient_image = document.createElement("img");
                        ingredient_image.setAttribute("src", SpoonImageURL(step_obj.ingredients[ingredient].image, "", "100x100", "ingredients"));
                        ingredient_image.setAttribute("alt", step_obj.ingredients[ingredient].name);
                        ingredient_figure.append(ingredient_image);

                        let ingredient_caption = document.createElement("figcaption");
                        ingredient_caption.textContent = step_obj.ingredients[ingredient].name;
                        ingredient_figure.append(ingredient_caption);

                        step_ingredient.append(ingredient_figure);
                    }
                }
                step_id.append(step_ingredient);
            }

            if (step_obj.equipment.length > 0) {
                let step_equipment = document.createElement("div");
                step_equipment.setAttribute("class", "step-figures");
                for (equipment = 0; equipment < step_obj.equipment.length; equipment++) {
                    if (step_obj.equipment[equipment].image != "") {
                        let equipment_figure = document.createElement("figure");

                        let equipment_image = document.createElement("img");
                        equipment_image.setAttribute("src", SpoonImageURL(step_obj.equipment[equipment].image, "", "100x100", "equipment"));
                        equipment_image.setAttribute("alt", step_obj.equipment[equipment].name);
                        equipment_figure.append(equipment_image);

                        let equipment_caption = document.createElement("figcaption");
                        equipment_caption.textContent = step_obj.equipment[equipment].name;
                        equipment_figure.append(equipment_caption);

                        step_equipment.append(equipment_figure);
                    }
                }
                step_id.append(step_equipment);
            }
            instruction_graphics.append(step_id);
        }
        instruction_section.append(instruction_graphics);
    }
    recipe_container.append(instruction_section);
}

function unitToggle () {
    // Remove buttons focus
    document.activeElement.blur();

    let btn_id = this.getAttribute("id");
    if (this.classList.contains("selected")) {
        // Already selected, do nothing
        return;
    }


    let US_style = "none";
    let metric_style = "none";
    if (btn_id == "btn-metric") {
        document.querySelector("#btn-US").classList.remove("selected");
        metric_style = "block";
    } else {
        document.querySelector("#btn-metric").classList.remove("selected");
        US_style = "block";
    }

    let metric_ingredients = document.querySelectorAll(".metric");
    for (let i = 0; i < metric_ingredients.length; i++) {
        metric_ingredients[i].style.display = metric_style;
    }

    let US_ingredients = document.querySelectorAll(".US");
    for (let i = 0; i < US_ingredients.length; i++) {
        US_ingredients[i].style.display = US_style;
    }

    this.classList.add("selected");
}

function instructionToggle () {
    // Remove buttons focus
    document.activeElement.blur();

    let btn_id = this.getAttribute("id");
    if (this.classList.contains("selected")) {
        // Already selected, do nothing
        return;
    }
    if (btn_id == "btn-graphics") {
        document.querySelector("#btn-text").classList.remove("selected");
        document.querySelector(".instruction_text").style.display = "none";
        document.querySelector(".instruction_graphics").style.display = "block";
    } else {
        document.querySelector("#btn-graphics").classList.remove("selected");
        document.querySelector(".instruction_graphics").style.display = "none";
        document.querySelector(".instruction_text").style.display = "block";
    }
    this.classList.add("selected");
}


function addToStorage (array_of_objects) {

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

    all_recipe_object = uploadOBJ;

    // Converts the object to a string and uploads to local storage
    var json_obj = JSON.stringify(uploadOBJ);
    localStorage.setItem("recipe_list", json_obj);
						   
}

document.querySelector(".navbar-brand").addEventListener("click", loadFrontPage, false);