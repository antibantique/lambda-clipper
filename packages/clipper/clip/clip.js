const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const { Readability } = require("@mozilla/readability");
const { JSDOM } = require("jsdom");
const axios = require("axios");

const USER_TOKEN = process.env["USER_TOKEN"];
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0";


async function main(args) {
  const userId = args.__ow_headers["x-user-id"];
  if (!userId) {
    return {
      error: {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: { message: "user id header required" }
      }
    }
  }
  if (userId !== USER_TOKEN) {
    return {
      error: {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: { message: "invalid user id" }
      }
    }
  }

  const url = args["url"];

  const response = await axios.get(
    url,
    headers={ "User-Agent": USER_AGENT }
  );

  if (response.status !== 200) {
    return {
      error: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        body: { message: "could not get url content" }
      }
    }
  }

  try {
    var doc = new JSDOM(response.data);
    var reader = new Readability(doc.window.document);
    var article = reader.parse();
  } catch (error) {
    console.error(error);
    return {
      error: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        body: { message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }
      }
    }
  }

  return { body: article }
}

exports.main = main;