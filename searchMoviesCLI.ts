import { question } from "readline-sync";
import { Client } from "pg";

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
        const text = "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE $1 AND kind = 'movie' ORDER BY date DESC LIMIT 10"
        const values = [`%${searchTerm}%`]

        const results = await client.query(text, values)
        console.table(results.rows)
        console.log('i tried to get your favourites but there are none')

        searchTerm = await question('Search for movie here (or q to quit): ') 
    } 
}

async function showFavourites(){
    //TO DO: edit query so that it shows the same information that you get from searching
        //This will probably use a JOIN
    const results = await client.query('SELECT * FROM favourites')
    console.table(results.rows)
}

async function execute(){  
    try{
        await client.connect()
        console.log("Connected successfully")

        //TO DO: format the interaction option nicer
            //Posibbly list the options on separate lines, then ask the question like in Selene example
        let interactionOption : string = await question('Do you want to (1) Search for movies, (2) See your favourites, (3) Quit ')
        while (interactionOption !== '3') {
            if (interactionOption === '1'){
                await searchForMovies()
                interactionOption = await question('Do you want to (1) Search for movies, (2) See your favourites, (3) Quit ')
            }
            else if (interactionOption === '2'){
                await showFavourites()
                interactionOption = await question('Do you want to (1) Search for movies, (2) See your favourites, (3) Quit ')
            }
            else {
                interactionOption = await question('Please choose option (1) , (2) , or (3) ')
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