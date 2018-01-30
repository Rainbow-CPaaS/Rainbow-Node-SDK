describe("AfterBuild test launcher", function() {
  it("Core Testing", function() {
    browser.get("http://localhost:8000/sdk/testing/index.html");

    element(by.id("Core")).click();
    element(by.id("startBtn")).click();
  });
});