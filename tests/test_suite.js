
import * as anchor from "@coral-xyz/anchor";
import * as snarkjs from "snarkjs";
import { buildBn128, utils } from "ffjavascript";
import { Transaction } from "@solana/web3.js";
import ProgramMethods from "./ProgramMethods/ProgramMethods.js"
import { convert_proof } from "../wasm/pkg/wasm.js";
import loadWasm from "./Initialization/WasmInit.js";
import { g1Uncompressed, g2Uncompressed, to32ByteBuffer} from "./Uncompression.js"
import program, {provider} from "./Initialization/AnchorProgramInit.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmPath = path.join(__dirname, "../circuit", "Vote.wasm");
const zkeyPath = path.join(__dirname, "../circuit", "Vote_final.zkey");
const { unstringifyBigInts } = utils;
const {SendVote, CreateVoteAccount} = ProgramMethods;
const voteAccount = anchor.web3.Keypair.generate();

describe("voting_program", () => {
    before(async () => {
        await loadWasm();
    });

    it("Creates a vote account", async () => {
        let transaction = new Transaction();
        const instruction = await CreateVoteAccount(program.methods, voteAccount);
        transaction.add(instruction);
        const signature = await provider.sendAndConfirm(transaction, [voteAccount]);
        //const voteState = await program.account.voteAccount.fetch(voteAccount.publicKey);
    });
    it("Votes for a candidate", async () => {
        let input = { "voterId":1 };
        let { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
        let curve = await buildBn128();
        let proofProc = unstringifyBigInts(proof);
        publicSignals = unstringifyBigInts(publicSignals);
        const pi_a = g1Uncompressed(curve, proofProc.pi_a);
        let proof_a = convert_proof(Buffer.from(pi_a))
        const pi_b = g2Uncompressed(curve, proofProc.pi_b);
        const pi_c = g1Uncompressed(curve, proofProc.pi_c);
        const publicSignalsBuffer = to32ByteBuffer(BigInt(publicSignals[0]));
        try {
            let transaction = new Transaction();
            transaction.add(
                anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
                    units: 1_400_000
                })
            );

            const instruction = await SendVote(program.methods, proof_a, pi_b, pi_c, publicSignalsBuffer, voteAccount);
            transaction.add(instruction);
            const signature = await provider.sendAndConfirm(transaction);
        } catch (e) {
            console.log(e)
        }
    });
});
            /*transaction.add(
                anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 2
                })
            );*/