const { handler } = require("./app");

const test = async () => {
  handler({
    street_address: "1234 N State St",
    count: 1,
  });
};

test();
