import { ethers } from 'ethers';
declare class AbiConfig {
    static abiEvent: any;
    static ticketEvent: any;
    static marketplaceEvent: any;
    static provider: ethers.JsonRpcProvider;
    static eventContractAddress: string;
    static ticketContractAddress: string;
    static marketplaceContractAddress: string;
    static eventcontract: ethers.Contract;
    static ticketcontract: ethers.Contract;
    static marketplacecontract: ethers.Contract;
}
export { AbiConfig };
