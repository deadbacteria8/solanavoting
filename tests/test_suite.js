
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import path from "path";
import * as snarkjs from "snarkjs";
import { buildBn128, utils } from "ffjavascript";
import { Connection, Keypair, Transaction } from "@solana/web3.js";

import { json } from "stream/consumers";
import initWasm, { convert_proof } from "../wasm/pkg/wasm.js";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { g1Uncompressed, g2Uncompressed, to32ByteBuffer} from "./Uncompression.js"
const { unstringifyBigInts } = utils;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmPath = path.join(__dirname, "../circuit", "Vote.wasm");
const zkeyPath = path.join(__dirname, "../circuit", "Vote_final.zkey");

async function loadWasm() {
    const wasmPath = join(__dirname, "../wasm/pkg/wasm_bg.wasm");
    const wasmBuffer = await readFile(wasmPath);
    await initWasm(wasmBuffer);
}
describe("voting_program", () => {
    before(async () => {
        // Initialize the WASM module before any tests run
        await loadWasm();
    });

    process.env.ANCHOR_PROVIDER_URL = "http://localhost:8899";
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.voting_program;
    const voteAccount = anchor.web3.Keypair.generate();

    it("Creates a vote account", async () => {
        await program.methods
        .createVoteAccount()
        .accounts({
            voteAccount: voteAccount.publicKey,
        })
        .signers([voteAccount])
        .rpc();
        //const voteState = await program.account.voteAccount.fetch(voteAccount.publicKey);

    });

    it("Votes for a candidate", async () => {

        let input = { "a":1,"b":5 };
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
            /*transaction.add(
                anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: 2
                })
            );*/
            const instruction = await program.methods
            .submitVote(proof_a, pi_b, pi_c, publicSignalsBuffer)
            .accounts({
                voteAccount: voteAccount.publicKey,
            })
            .signers()
            .instruction();
            transaction.add(instruction);
            const signature = await provider.sendAndConfirm(transaction);
        } catch (e) {
            console.log(e)
        }
    });
});
