const generateInitialRoute = require("./generateInitialRoute.js");
const generateNewRoute = require("./generateNewRoute.js");
const { cost,
    preloadGeocodes,
    preloadDistances
 } = require("./helperFunctions.js");
 
async function simulatedAnnealing (
    pool,
    T=900, 
    T_min=1, 
    alpha=0.99
) {
    
    //compute the initial state
    let S = await generateInitialRoute(pool);
    if (!S) {
        return null;
    }

    //preload geocodes + distances once 
    await preloadGeocodes(S);
    await preloadDistances(S);

    let C = await cost(S);
    

    while (T > T_min) {
        //compute the new state
        let S_new = await generateNewRoute(S);
        let C_new = await cost(S_new);

        //accept the new state if the cost is lower -> exploitation
        if (C_new < C) {
            S = S_new;
            C = C_new;
        } 
        //accept the new state with a probability p -> exploration
        else {
            const p = Math.exp((C - C_new) / T);
            if (Math.random() < p) {
                S = S_new;
                C = C_new;
            }
        }
        T *= alpha;
    }
    return S;
}

module.exports = simulatedAnnealing;

//test -> node simulatedAnnealing.js
async function test() {

    const { pool } = require("../Database/sql_pools.js");
    
    const S_init = await generateInitialRoute(pool);

    const S = await simulatedAnnealing(pool);

    console.log("Initial cost:", await cost(S_init));
    console.log("Final cost:", await cost(S));
}

//test();