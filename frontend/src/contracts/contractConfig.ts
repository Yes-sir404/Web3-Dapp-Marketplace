import { ethers } from "ethers";
// import marketplaceArtifact from "../../../artifacts/contracts/Marketplace.sol/Marketplace.json";
import { MARKETPLACE_ABI_VAR } from "../ABI";
// Your deployed contract address (you'll get this after deploying)
export const CONTRACT_ADDRESS = "0xBCe850190CEF1F643450564118f0f346e3c1c40a";

// ABI (Application Binary Interface) - tells frontend how to talk to your contract
// This is generated when you compile your Solidity contract
export const MARKETPLACE_ABI = MARKETPLACE_ABI_VAR;
// ✅ Utility functions with proper error handling
export const bdagToWei = (bdag: string): string => {
  try {
    if (!bdag || isNaN(parseFloat(bdag))) {
      throw new Error("Invalid BDAG amount");
    }
    return ethers.parseEther(bdag).toString();
  } catch (error) {
    console.error("Error converting BDAG to Wei:", error);
    throw new Error("Failed to convert BDAG to Wei");
  }
};

export const weiToBdag = (wei: string): string => {
  try {
    if (!wei || isNaN(parseFloat(wei))) {
      throw new Error("Invalid Wei amount");
    }
    return ethers.formatEther(wei);
  } catch (error) {
    console.error("Error converting Wei to BDAG:", error);
    return "0";
  }
};

// ✅ Price conversion with caching
// ✅ Price conversion with fallback (manual value for BDAG)
class PriceCache {
  private cache: { price: number; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly FIXED_BDAG_PRICE = 0.05; // <-- set BDAG price in USD (example: $0.05)

  async getBDAGPrice(): Promise<number> {
    const now = Date.now();

    // If we already cached a value, return it
    if (this.cache && now - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.price;
    }

    try {
      // Try fetching from API (in case BDAG is listed later)
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=blockdag&vs_currencies=usd",
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) throw new Error("API not available yet");

      const data = await response.json();
      const price = data.blockdag?.usd;

      if (typeof price !== "number") throw new Error("Invalid data");

      this.cache = { price, timestamp: now };
      return price;
    } catch {
      console.warn(
        "⚠️ Falling back to fixed BDAG price:",
        this.FIXED_BDAG_PRICE
      );
      return this.FIXED_BDAG_PRICE;
    }
  }
}

const priceCache = new PriceCache();

export const weiToUSD = async (weiAmount: string): Promise<string> => {
  try {
    const bdagAmount = parseFloat(weiToBdag(weiAmount));
    const bdagPrice = await priceCache.getBDAGPrice();
    const usdValue = bdagAmount * bdagPrice;
    return usdValue.toFixed(2);
  } catch (error) {
    console.error("Error converting Wei to USD:", error);
    return "0.00";
  }
};

export const bdagToUSD = async (bdagAmount: string): Promise<string> => {
  try {
    const bdagPrice = await priceCache.getBDAGPrice();
    const usdValue = parseFloat(bdagAmount) * bdagPrice;
    return usdValue.toFixed(2);
  } catch (error) {
    console.error("Error converting BDAG to USD:", error);
    return "0.00";
  }
};

// ✅ Contract validation
export const validateContractAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

// ✅ Export types for better TypeScript support
export interface ContractError {
  reason?: string;
  message: string;
  code?: string | number;
  data?: any;
}

export interface TransactionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  productId?: string;
}

//////////////////////////////////////////////////////////////////////////////////////
