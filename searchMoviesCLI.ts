import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: 'omdb' });
console.log("Welcome to search-movies-cli!");

async function execute(){
    
    try{
        await client.connect()
        console.log("Connected successfully")

        let interactionOption : string = await question('Do you want to (1) Search for movies, (2) See your favourites, (3) Quit ')
        if (interactionOption === '1'){
            let searchTerm = await question('Search for movie here (or q to quit): ')

            while (searchTerm !== 'q'){
                const text = "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE $1 AND kind = 'movie' ORDER BY date DESC LIMIT 10"
                const values = [`%${searchTerm}%`]
        
                const results = await client.query(text, values)
                console.table(results.rows)
        
                searchTerm = await question('Search for movie here (or q to quit): ') 
            } 
        }
        else if (interactionOption === '2'){
            console.log('favourites')
        }
        else if (interactionOption === '3'){
            client.end()
            console.log('Disconnected')
        }
        else {
            interactionOption = await question('Please choose option 1 , 2 , or 3 ')
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