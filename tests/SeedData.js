import KeyPairs from "./TestData/KeyPairs.js";
import ProgramMethods from "./ProgramMethods/ProgramMethods.js";
const {createVoteAccount} = ProgramMethods;
function AddParties() {
    for(var i in KeyPairs) {
        //createVoteAccount(keyPair.Key);
        console.log(KeyPairs[i].Party)
        console.log(KeyPairs[i].Key)
    }
}

AddParties();