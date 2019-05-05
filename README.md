<p align="center">
  <a href="https://www.myetpwallet.com/">
    <img src="https://raw.githubusercontent.com/mvs-org/lightwallet/master/src/assets/logo.png" alt="">
  </a>
</p>

The Metaverse Coin Bridge is a service to exchange Metaverse ETP with other Coins like Bitcoin, Ethereum, Ethereum Classic and many more. It uses [SWFT](https://www.swft.pro) as a gateway.

# Deployment
You need to have a firebase account and a project that can access external resources (blaze plan).

To install the firebase cli just run

```
npm install -g firebase-tools
```

To deploy the code to your project you just need to run

```
firebase deploy --project YOUR_PROJECT_NAME
```

# Documentation

For a detailed API documentation you can either generate it yourself by running `npm run apidoc` or just visit [bridge.mvs.org](https://bridge.mvs.org).

If you generate the API documentation yourself you can easily upload it to your project using:

```
firebase deploy --only hosting --project YOUR_PROJECT_NAME
```

# Contribution

We <3 our contributors! Many thanks to all supporters. We want to encourage everyone to become part of the development and support us with translations, testing and patches. If you want to help us please don't hesitate to contact us and become a part of the community.
