import { question } from "readline-sync";
import { Client, QueryResult } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: 'omdb' });
console.log("Welcome to search-movies-cli!");

async function searchForMovies(){
    let searchTerm = await question('Search for movie here (or q to quit): ')
    await handleSearch(searchTerm)
}

async function handleSearch(searchTerm : string){
    while (searchTerm !== 'q'){
        const text = "SELECT id, name, TO_CHAR(movies.date, 'dd Mon, yyyy') AS date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE $1 AND kind = 'movie' ORDER BY date DESC LIMIT 10"
        const values = [`%${searchTerm}%`]

        const results = await client.query(text, values)
        console.table(results.rows)

        let userWantsToAddFavourite = await question('Do you want to add any of these to your favourites (y, n): ')
        if (userWantsToAddFavourite === 'y') {
            await addToFavourites(results)
        }

        searchTerm = await question('Search for another movie here (or q to quit): ') 
    } 
}

async function addToFavourites(results : QueryResult<any>){
    const indexToAddToFavourites = await question('Please enter the row number of the movie you\'d like to add: ')
    const [movieId, movieName] = findMovieDetails(indexToAddToFavourites, results)

    //TO DO: make sure that favourite hasn't already been added
    const insertText = "INSERT INTO favourites (movie_id) VALUES ($1)"
    const insertValues = [`${movieId}`]
    console.log(`\nSaving favourite movie: ${movieName}\n`)

    await client.query(insertText, insertValues)
    
}

//TO DO: Add return type
function findMovieDetails(index : string, results : QueryResult<any>): [string, string]{
    const intIndex = parseInt(index)
    const foundMovieId = results.rows[intIndex].id
    const foundMovieName = results.rows[intIndex].name

    return [foundMovieId, foundMovieName]
}

async function showFavourites(){
    //TO DO: edit query so that it shows the same information that you get from searching
        //This will probably use a JOIN
    const results = await client.query("SELECT DISTINCT movies.id, movies.name,  TO_CHAR(movies.date, 'dd Mon, yyyy') AS date, movies.runtime, movies.budget, movies.revenue, movies.vote_average, movies.votes_count FROM movies JOIN favourites ON movies.id = favourites.movie_id")
    console.table(results.rows)
}

async function execute(){  
    try{
        await client.connect()
        console.log("\n")

        const menuOptions = '[1] Search for movies,\n[2] See your favourites,\n[3] Quit\n\nChoose an option [1, 2, 3]: '

        let chosenMenuOption : string = await question(menuOptions)
        while (chosenMenuOption !== '3') {
            if (chosenMenuOption === '1'){
                await searchForMovies()
                chosenMenuOption = await question(menuOptions)
            }
            else if (chosenMenuOption === '2'){
                await showFavourites()
                chosenMenuOption = await question(menuOptions)
            }
            else {
                chosenMenuOption = await question('Please choose an option [1, 2, 3]: ')
            }
        } 
    } 
    catch (ex) {
        console.log(`Error connecting: ${ex}`)
    }
    finally {
        await client.end()
        console.log("Client disconnected successfully")
    }
}

execute()