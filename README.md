# ezpp calculation library

osu! performance point calculation library used by the browser extension ezpp!

# Development

Install dependencies by running:
```
yarn install
```

## Testing

The test beatmap dataset is stored using [Git Large File Storage](https://git-lfs.github.com/). Download and extract the test beatmap dataset by running (this only needs to be done once):
```
yarn extract-test-data
```
Or alternatively run the commands individually:
```
git lfs pull
cd test/data/
tar -xzf maps.tar.gz
```

Once the dataset is extracted, you can test your changes by running:
```
yarn test
```
