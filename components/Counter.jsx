'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus } from "lucide-react";

const Counter = ({ productId }) => {
    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();

    return (
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-100 bg-[#f4f8f5] px-1.5 py-1 text-slate-700">
            <button
                type="button"
                onClick={() => dispatch(removeFromCart({ productId }))}
                className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white"
                aria-label="Decrease quantity"
            >
                <Minus size={14} />
            </button>
            <p className="min-w-[1.5rem] text-center text-sm font-semibold">{cartItems[productId]}</p>
            <button
                type="button"
                onClick={() => dispatch(addToCart({ productId }))}
                className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white"
                aria-label="Increase quantity"
            >
                <Plus size={14} />
            </button>
        </div>
    )
}

export default Counter
