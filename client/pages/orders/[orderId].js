import { useEffect, useState } from "react";
import useRequest from "../../hooks/use-request";
import StripeCheckout from 'react-stripe-checkout';
import Router from "next/router";
// react-stripe-checkout requires "prop-types": "^15.5.8" as a dependency

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders'),
    });
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);
        // Only called on navigation redirect due to [] intial dependencies
        return () => {
            clearInterval(timerId);
        };
    }, [order]);

    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }
    
    return (
    <div>
        Time left to pay: {timeLeft}
        <StripeCheckout token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51L34KRGAZfrgxAeE3Vku1aCRDurO3hlXqKOor625dPpSm92ByYcBRo5BJ9ZSOxlQ3p8ojISNlDIMhrcWZDaGGwJ700aBS7c1VY"
        amount={order.ticket.price * 100}
        email={currentUser.email}>
        </StripeCheckout>
        {errors}
    </div>);
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
};

export default OrderShow;