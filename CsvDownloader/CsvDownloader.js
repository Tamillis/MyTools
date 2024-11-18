class CsvDownloader {
    static toCapitalizedWords(name) {
        var words = name.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
        return words.map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
    }

    static IsCsvCompatible(data) {
        if (!Array.isArray(data)) {
            console.error("Data is not an array");
            return false;
        }
        let prevProps = "";
        for (let row of data) {
            // let row = data[i];
            if (typeof row !== 'object' || Array.isArray(row) || row == null) {
                console.error("Row of data is not an JS object");
                return false;
            }
            let props = "";
            for (let prop in row) {
                props += prop + ",";
            }

            //if the properties of the previous row don't match this one
            if (i > 0 && prevProps !== props) {
                console.error("Row of data doesn't fit columns");
                return false;
            }
            prevProps = props;
        }

        return true;
    }

    static arrToCsv(arr) {
        //assuming passed in array of data arr has passed IsCsvCompatible
        //get col headers
        let headings = "";
        for (let property in arr[0]) {
            if (this.attributes.displayHeadings.hasOwnProperty(property)) headings += this.attributes.displayHeadings[property] + ",";
            else headings += CsvDownloader.toCapitalizedWords(property) + ",";
        }
        //remove trailing comma
        headings = headings.slice(0, -1);
        headings += "\n";

        //get row data
        let body = "";
        for (let row of arr) {
            for (let prop in row) {
                let cellData = row[prop];
                if (this.attributes.displayValues.hasOwnProperty(prop)) {
                    if (Array.isArray(this.attributes.displayValues[prop])) {
                        for (let dv of this.attributes.displayValues[prop]) {
                            if(dv.value == cellData) cellData = dv.displayValue;
                        }
                    } else if (this.attributes.displayValues[prop].value == cellData) {
                        cellData = this.attributes.displayValues[prop].displayValue;
                    }
                } 

                if (cellData instanceof Date) cellData = cellData.toLocaleDateString();

                if (cellData == null) cellData = '';
                else if (cellData.toString().includes(",")) cellData = `"${cellData}"`;

                body += cellData + ",";
            }
            body = body.slice(0, -1);
            body += "\n";
        }
        return headings + body;
    }

    static download(data, filename, attributes = {}) {
        this.attributeDefaults = {
            type: "text/csv;charset=utf-16;",
            displayHeadings: false,
            displayValues: false
        }

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        }

        if (this.attributes.type == "text/csv;charset=utf-8;" && !this.IsCsvCompatible(data)) return;

        try {
            //For csv's the Blob size limit hopefully won't be an issue
            //See https://github.com/eligrey/FileSaver.js/#supported-browsers 'Construct as Blob'
            let newDataURL = window.URL.createObjectURL(new Blob([this.arrToCsv(data)], { type: this.attributes.type, name: filename }));
            let a = document.createElement("a");
            a.download = filename;
            a.href = newDataURL;
            a.click();
            window.URL.revokeObjectURL(newDataURL);
        }
        catch (e) {
            console.error("Error attempting to download data", e);
        }
    }
}