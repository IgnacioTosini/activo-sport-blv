import { CartItem as CartItemType, useCartStore } from '@/store/cart.store';
import Image from 'next/image';
import { formatCurrency } from '@/utils';
import { GoTrash } from 'react-icons/go';
import { FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import './_cartItem.scss';

interface Props {
    item: CartItemType;
}

export const CartItem = ({ item }: Props) => {
    const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    return (
        <li className="cartItem">
            <Image src={item.image} alt={item.name} className="cartItemImage" width={100} height={100} />
            <div className="cartItemInfo">
                <p className="cartItemBrand">{item.brand}</p>
                <Link href={`/producto/${item.slug}`} className="cartItemName">{item.name}</Link>
                <p className="cartItemSize">Talle {item.sizeLabel}</p>
                <div className="cartItemActions">
                    <div className="cartQtyControls">
                        <button
                            type="button"
                            onClick={() => updateItemQuantity(item.productId, item.sizeId, item.quantity - 1)}
                            aria-label="Restar cantidad"
                            className="cartQtyDecrement"
                        >
                            -
                        </button>
                        <span className="cartQtyValue">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => updateItemQuantity(item.productId, item.sizeId, item.quantity + 1)}
                            aria-label="Sumar cantidad"
                            className="cartQtyIncrement"
                        >
                            <FiPlus />
                        </button>
                    </div>

                    <button
                        type="button"
                        className="cartRemoveButton"
                        onClick={() => removeItem(item.productId, item.sizeId)}
                        aria-label="Eliminar producto"
                    >
                        <GoTrash />
                    </button>
                </div>
            </div>
            <p className="cartItemPrice">{formatCurrency(item.price * item.quantity)}</p>
        </li>
    );
};
