import { BorrowItem } from "../types/campus";
import { mockBorrowItems } from "../data/mockData";

const STORAGE_KEY = "campushub_borrow_v1";

export function getStoredBorrowItems(): BorrowItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading borrow items from localStorage", e);
  }
  return [...mockBorrowItems];
}

export function saveStoredBorrowItems(items: BorrowItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("campushub_borrow_updated"));
  } catch (e) {
    console.error("Error saving borrow items to localStorage", e);
  }
}

export function checkoutBorrowItem(
  itemId: string,
  proofData?: {
    photoUrl?: string;
    borrowerName?: string;
    borrowerId?: string;
    conditionNotes?: string;
  }
): { success: boolean; item?: BorrowItem; message: string } {
  const items = getStoredBorrowItems();
  const index = items.findIndex((i) => i.id === itemId);

  if (index === -1) {
    return { success: false, message: "Item not found in inventory." };
  }

  const target = items[index];
  if (target.availableQuantity <= 0) {
    return { success: false, message: "All units of this item are currently checked out." };
  }

  const newQty = target.availableQuantity - 1;
  const now = new Date();
  const timeStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updatedItem: BorrowItem = {
    ...target,
    availableQuantity: newQty,
    availability: newQty === 0 ? "Currently Borrowed" : "Available",
    borrowedByMe: true,
    dueDate: target.maxDuration.includes("Same Day") ? "Today by 6:00 PM" : `Due in ${target.maxDuration}`,
    proofPhotoUrl: proofData?.photoUrl,
    borrowerName: proofData?.borrowerName || "Sarang P",
    borrowerId: proofData?.borrowerId || "21CS042",
    borrowedAt: timeStr,
    conditionNotes: proofData?.conditionNotes || "Handover verified in good working condition.",
  };

  items[index] = updatedItem;
  saveStoredBorrowItems(items);

  return {
    success: true,
    item: updatedItem,
    message: `Verified Handover Complete: ${target.name} registered to ${updatedItem.borrowerName} (${updatedItem.borrowerId}) with photo proof!`,
  };
}

export function returnBorrowItem(itemId: string): { success: boolean; item?: BorrowItem; message: string } {
  const items = getStoredBorrowItems();
  const index = items.findIndex((i) => i.id === itemId);

  if (index === -1) {
    return { success: false, message: "Item not found in inventory." };
  }

  const target = items[index];
  const newQty = Math.min(target.totalQuantity, target.availableQuantity + 1);

  const updatedItem: BorrowItem = {
    ...target,
    availableQuantity: newQty,
    availability: "Available",
    borrowedByMe: false,
    dueDate: undefined,
    proofPhotoUrl: undefined,
    borrowerName: undefined,
    borrowerId: undefined,
    borrowedAt: undefined,
    conditionNotes: undefined,
  };

  items[index] = updatedItem;
  saveStoredBorrowItems(items);

  return {
    success: true,
    item: updatedItem,
    message: `Successfully returned ${target.name} to ${target.location}. Handover photo proof archived and your student record is cleared!`,
  };
}

export function addNewBorrowItem(itemData: Omit<BorrowItem, "id" | "availability">): BorrowItem {
  const items = getStoredBorrowItems();
  const newItem: BorrowItem = {
    ...itemData,
    id: `item-${Date.now()}`,
    availability: itemData.availableQuantity > 0 ? "Available" : "Currently Borrowed",
  };

  const updated = [newItem, ...items];
  saveStoredBorrowItems(updated);
  return newItem;
}

export function resetStoredBorrowItems(): BorrowItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("campushub_borrow_updated"));
  } catch (e) {
    console.error("Error resetting borrow items", e);
  }
  return [...mockBorrowItems];
}
