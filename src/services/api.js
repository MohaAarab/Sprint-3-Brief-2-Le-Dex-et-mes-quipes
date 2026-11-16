


export async function request(method,route,body) {
    const url=`http://localhost:3000${route}`;
    try{
            const response=await fetch(url,{method})
            
            if(!response.ok){
                throw new Error ("HTTP error: " + response.status)
            }
            
            const data= await response.json();
            
            return data
            
        }catch(error){
            throw error
        }
}
