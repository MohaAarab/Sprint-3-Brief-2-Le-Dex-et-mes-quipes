


export  async function request(method,route,body) {
    const url=`http://localhost:3000${route}`;
    const options={
        method:method
    }
    if(body !== undefined){
        Object.assign(options,{headers :{'Content-Type' : 'application/json'}, body:JSON.stringify(body)})
    }
    try{
            const response=await fetch(url,options)
            
            if(!response.ok){
                throw new Error ("HTTP error: " + response.status)
            }
            
            const data= await response.json();
            
            return data
            
        }catch(error){
            throw error
        }
}


export async function getCreature(id){
   return await request("GET",`/creatures/${id}`)
}

export async function createCreature(creature) {
   return await request("POST","/creatures",creature )
}