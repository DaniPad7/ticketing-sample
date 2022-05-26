import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppOne = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser}></Header>
            <div className='container'>
                <Component currentUser={currentUser} {...pageProps}></Component>
            </div>
        </div>
    );
};

AppOne.getInitialProps = async (appCtx) => {
    console.log('App Custom App');
    const client = buildClient(appCtx.ctx);
    const { data } = await client.get('/api/users/currentuser').catch(
        err => console.log(err.message)
    );
    let pageProps = {};
    if (appCtx.Component.getInitialProps) {
        // We are calling LandingPages' getInitialProps with the req in there
        pageProps =  await appCtx.Component.getInitialProps(appCtx.ctx, client, data.currentUser);
    }
    console.log(pageProps);
    return { pageProps, currentUser: data.currentUser };
};

export default AppOne;