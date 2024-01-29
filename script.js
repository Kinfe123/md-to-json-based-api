const fs = require("fs");

var tableMarkdown = ``;

export const extract = (filePath) => {

  const result = []
  fs.readFile("readme.md", "utf-8", (err, tableMarkdown) => {
    if (err) {
      console.log("Error has occured", err);
      return;
    }

    // this will be for mocking the api blob response from readme file

   
    const trimmed = tableMarkdown.trim();
    const eachRow = trimmed.split("\n");

    const headerParser = (row) => {
      return row
        .split("|")
        .map((r) => r.trim())
        .filter((r) => r !== "");
    };

    const headers = headerParser(eachRow[0]);

    const theRest = eachRow.slice(2, eachRow.length);

    const test = "[Alice's Website](https://example.com/alice)";

    const linkFlag = ["https://", "http://"];

    // const websiteIdx = headers.indexOf("Website");

    for (eachCol of theRest) {
      let current_parsed = headerParser(eachCol);

      let counter = 0;
      let currentObj = {};

      for (eachVal of current_parsed) {
        let currentKey = headers[counter];

        if (eachVal.includes(linkFlag[0]) || eachVal.includes(linkFlag[1])) {
          let openSquareIdx = eachVal.indexOf("[");
          let closeSquareIdx = eachVal.indexOf("]");
          const add = eachVal.length - closeSquareIdx;
          let openIdx =
            eachVal.slice(closeSquareIdx, eachVal.length).indexOf("(") +
            closeSquareIdx;
          let closeIdx =
            eachVal.slice(closeSquareIdx, eachVal.length).indexOf(")") +
            closeSquareIdx;
          // we have to identify the link even if there exit () in link helper

          let parsedLink = eachVal.slice(openIdx + 1, closeIdx);
          let parsedLinkHelper = eachVal.slice(
            openSquareIdx + 1,
            closeSquareIdx
          );
          currentObj["link"] = parsedLink;
          currentObj[currentKey] = parsedLinkHelper;
          counter += 1;
          continue;
        } else {
          currentObj[currentKey] = eachVal;
        }
        counter += 1;
      }
      result.push(currentObj);
    }
  });
  return result
};

console.log("The result is: ", result);

const url =
  "https://api.github.com/repos/workos/awesome-developer-experience/git/blobs/fe28415d2d46ac325a12df8292f7cc005aef57ce";

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    // Retrieve the Base64 encoded content from the response
    const content = data.content;

    // Decode the Base64 content into a binary string
    const binaryString = atob(content);

    const firstPipe = binaryString.indexOf("|");
    let title = "";
    // this is the trail implementatation for finding the title of the mdx content

    // for (let i = firstPipe - 2; i >= 0; i++) {
    //   let currentChar = binaryString[i];
    //   if (currentChar) {
    //     let c = i;

    //     while (binaryString[c] !== "") {
    //       title += binaryString[c];
    //       console.log("Findinf the title : ", title);
    //       c -= 1;
    //       if (binaryString[c] === "") {
    //         break;
    //       }
    //     }
    //   }
    // }
    const lineBefore = binaryString.slice(firstPipe - 2, binaryString.length);
    // console.log("The binary data: ", title);

    const trimmedTableMarkdown = binaryString.trim();

    // Split the table content into rows
    const rows = trimmedTableMarkdown.split("\n");

    // Extract the table headers from the first row
    const headers = rows[0]
      .split("|")
      .map((header) => header.trim())
      .filter((header) => header !== "");

    // Extract the table data from the remaining rows
    const datas = rows.slice(2).map((row) => {
      const columns = row
        .split("|")
        .map((column) => column.trim())
        .filter((column) => column !== "");
      const rowData = {};
      headers.forEach((header, index) => {
        if (header !== "Website") {
          rowData[header] = columns[index];
        } else {
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
          const linkMatch = columns[index].match(linkRegex);
          if (linkMatch) {
            rowData["Link"] = {
              text: linkMatch[1],
              url: linkMatch[2],
            };
          } else {
            rowData["Link"] = {
              text: "",
              url: "",
            };
          }
        }
      });
      return rowData;
    });

    // Convert the table data to JSON format
    const jsonData = JSON.stringify(datas, null, 2);
    // console.log('The data is : ' , jsonData)

    // Use the binary string as needed

    // the time to convert the readme file to the actual JSON file
    // const trimmedTableMarkdown = binaryString.trim();
    // console.log(Extractor.extractObject(trimmedTableMarkdown, "columns", true));

    // // Split the table content into rows
    // const rows = trimmedTableMarkdown.split("\n");

    // // Extract the table headers from the first row
    // const headers = rows[0]
    //   .split("|")
    //   .map((header) => header.trim())
    //   .filter((header) => header !== "");

    // // Extract the table data from the remaining rows
    // const datas = rows.slice(2).map((row) => {
    //   const columns = row
    //     .split("|")
    //     .map((column) => column.trim())
    //     .filter((column) => column !== "");
    //   const rowData = {};
    //   headers.forEach((header, index) => {
    //     rowData[header] = columns[index];
    //   });
    //   return rowData;
    // });

    // // Convert the table data to JSON format
    // const jsonData = JSON.stringify(datas, null, 2);

    // console.log("The json data : ", jsonData);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
