(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "Packager\n========\n\nThe main responsibilities of the packager are bundling dependencies, and\ncreating the package.\n\nSpecification\n-------------\n\nA package is a json object with the following properties:\n\n`dependencies` an object whose keys are names of dependencies within our context\nand whose values are packages.\n\n`distribution` an object whose keys are extensionless file paths and whose\nvalues are executable code compiled from the source files that exist at those paths.\n\n`source` an object whose keys are file paths and whose values are source code.\nThe `source` can be loaded and modified in an editor to recreate the compiled\npackage.\n\nIf the environment or dependecies contain all the tools required to build the\npackage then theoretically `distribution` may be omitted as it can be recreated\nfrom `source`.\n\nFor a \"production\" distribution `source` may be omitted, but that will greatly\nlimit adaptability of packages.\n\nThe package specification is closely tied to the `require` method. This allows\nus to use a simplified Node.js style `require` from the browser.\n\n[Require Docs](http://distri.github.io/require/docs)\n",
      "mode": "100644",
      "type": "blob"
    },
    "TODO.md": {
      "path": "TODO.md",
      "content": "TODO\n====\n\n- Remove jQuery dependency.\n",
      "mode": "100644",
      "type": "blob"
    },
    "memoize_promise.coffee": {
      "path": "memoize_promise.coffee",
      "content": "module.exports = (fn) ->\n  cache = {}\n\n  memoized = (key) ->\n    unless cache[key]\n      cache[key] = fn.apply(this, arguments)\n\n      cache[key].catch ->\n        delete cache[key]\n\n    return cache[key]\n\n    return memoized\n",
      "mode": "100644",
      "type": "blob"
    },
    "packager.coffee.md": {
      "path": "packager.coffee.md",
      "content": "Packager\n========\n\nThe main responsibilities of the packager are bundling dependencies, and\ncreating the package.\n\nSpecification\n-------------\n\nA package is a json object with the following properties:\n\n`dependencies` an object whose keys are names of dependencies within our context\nand whose values are packages.\n\n`distribution` an object whose keys are extensionless file paths and whose\nvalues are executable code compiled from the source files that exist at those paths.\n\n`source` an object whose keys are file paths and whose values are source code.\nThe `source` can be loaded and modified in an editor to recreate the compiled\npackage.\n\nIf the environment or dependecies contain all the tools required to build the\npackage then theoretically `distribution` may be omitted as it can be recreated\nfrom `source`.\n\nFor a \"production\" distribution `source` may be omitted, but that will greatly\nlimit adaptability of packages.\n\nThe package specification is closely tied to the `require` method. This allows\nus to use a simplified Node.js style `require` from the browser.\n\nDependencies\n------------\n\n    MemoizePromise = require \"./memoize_promise\"\n\nHelpers\n-------\n\nThe path to the published package json. This is the primary build product and is\nused when requiring in other packages and running standalone html.\n\n    jsonPath = ({repository:{branch}}) ->\n      \"#{branch}.json\"\n\nCheck if repository is publishing to default branch.\n\n    isDefault = (pkg) ->\n      {repository} = pkg\n      {branch} = repository\n\n      branch is repository.default_branch\n\n    relativePackagePath = (pkg) ->\n      if isDefault(pkg)\n        jsonPath(pkg)\n      else\n        \"../#{jsonPath(pkg)}\"\n\nLauncher\n\n    launcherScript = (pkg) ->\n      \"\"\"\n        <script>\n          xhr = new XMLHttpRequest;\n          url = #{JSON.stringify(relativePackagePath(pkg))};\n          xhr.open(\"GET\", url, true);\n          xhr.responseType = \"json\";\n          xhr.onload = function() {\n            (function(PACKAGE) {\n              var src = #{JSON.stringify(PACKAGE.dependencies.require.distribution.main.content)};\n              var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n              var require = Require.generateFor(PACKAGE);\n              require('./' + PACKAGE.entryPoint);\n            })(xhr.response)\n          };\n        <\\/script>\n      \"\"\"\n\n    startsWith = (string, prefix) ->\n      string.match RegExp \"^#{prefix}\"\n\nCreate a rejected promise with the given message.\n\n    reject = (message) ->\n      Promise.reject new Error message\n\nA standalone html page for a package.\n\n    html = (pkg) ->\n      \"\"\"\n        <!DOCTYPE html>\n        <html manifest=\"manifest.appcache?#{+new Date}\">\n          <head>\n            <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n            #{dependencyScripts(pkg.remoteDependencies)}\n          </head>\n          <body>\n            #{launcherScript(pkg)}\n          </body>\n        </html>\n      \"\"\"\n\nAn HTML5 cache manifest for a package.\n\n    cacheManifest = (pkg) ->\n      # TODO: Add js file\n      \"\"\"\n        CACHE MANIFEST\n        # #{+ new Date}\n\n        CACHE:\n        index.html\n        #{relativePackagePath(pkg)}\n        #{(pkg.remoteDependencies or []).join(\"\\n\")}\n\n        NETWORK:\n        https://*\n        http://*\n        *\n      \"\"\"\n\n`makeScript` returns a string representation of a script tag that has a src\nattribute.\n\n    makeScript = (src) ->\n      \"<script src=#{JSON.stringify(src)}><\\/script>\"\n\n`dependencyScripts` returns a string containing the script tags that are\nthe remote script dependencies of this build.\n\n    dependencyScripts = (remoteDependencies=[]) ->\n      remoteDependencies.map(makeScript).join(\"\\n\")\n\nIf our string is an absolute URL then we assume that the server is CORS enabled\nand we can make a cross origin request to collect the JSON data.\n\nWe also handle a Github repo dependency such as `STRd6/issues:master`.\nThis loads the package from the published gh-pages branch of the given repo.\n\n`STRd6/issues:master` will be accessible at `http://strd6.github.io/issues/master.json`.\n\n    fetchDependency = MemoizePromise (path) ->\n      if typeof path is \"string\"\n        if startsWith(path, \"http\")\n          ajax.getJSON(path)\n          .catch ({status, response}) ->\n            switch status\n              when 0\n                message = \"Aborted\"\n              when 404\n                message = \"Not Found\"\n              else\n                throw new Error response\n\n            throw \"#{status} #{message}: #{path}\"\n        else\n          if (match = path.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))\n            [callback, user, repo, branch] = match\n\n            url = \"https://#{user}.github.io/#{repo}/#{branch}.json\"\n\n            ajax.getJSON(url)\n            .catch ->\n              throw new Error \"Failed to load package '#{path}' from #{url}\"\n          else\n            reject \"\"\"\n              Failed to parse repository info string #{path}, be sure it's in the\n              form `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\n              or `STRd6/editor:v0.9.1`\n            \"\"\"\n      else\n        reject \"Can only handle url string dependencies right now\"\n\nImplementation\n--------------\n\n    Ajax = require \"ajax\"\n    ajax = Ajax()\n\n    Packager =\n      collectDependencies: (dependencies) ->\n        names = Object.keys(dependencies)\n\n        Promise.all(names.map (name) ->\n          value = dependencies[name]\n\n          fetchDependency value\n\n        ).then (results) ->\n          bundledDependencies = {}\n\n          names.forEach (name, i) ->\n            bundledDependencies[name] = results[i]\n\n          return bundledDependencies\n\nCreate the standalone components of this package. An html page that loads the\nmain entry point for demonstration purposes and a json package that can be\nused as a dependency in other packages.\n\nThe html page is named `index.html` and is in the folder of the ref, or the root\nif our ref is the default branch.\n\nDocs are generated and placed in `docs` directory as a sibling to `index.html`.\n\nAn application manifest is served up as a sibling to `index.html` as well.\n\nThe `.json` build product is placed into the root level, as siblings to the\nfolder containing `index.html`. If this branch is the default then these build\nproducts are placed as siblings to `index.html`\n\nThe optional second argument is an array of files to be added to the final\npackage.\n\n      standAlone: (pkg, files=[]) ->\n        repository = pkg.repository\n        branch = repository.branch\n\n        if isDefault(pkg)\n          base = \"\"\n        else\n          base = \"#{branch}/\"\n\n        add = (path, content) ->\n          files.push\n            content: content\n            mode: \"100644\"\n            path: path\n            type: \"blob\"\n\n        add \"#{base}index.html\", html(pkg)\n        add \"#{base}manifest.appcache\", cacheManifest(pkg)\n\n        json = JSON.stringify(pkg, null, 2)\n\n        add jsonPath(pkg), json\n\n        return files\n\nGenerates a standalone page for testing the app.\n\n      testScripts: (pkg) ->\n        {distribution} = pkg\n\n        testProgram = Object.keys(distribution).filter (path) ->\n          path.match /test\\//\n        .map (testPath) ->\n          \"require('./#{testPath}')\"\n        .join \"\\n\"\n\n        \"\"\"\n          #{dependencyScripts(pkg.remoteDependencies)}\n          <script>\n            #{require('require').packageWrapper(pkg, testProgram)}\n          <\\/script>\n        \"\"\"\n\n      relativePackagePath: relativePackagePath\n\n    module.exports = Packager\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.7.0-pre.0\"\nentryPoint: \"packager\"\ndependencies:\n  ajax: \"distri/ajax:v0.1.4\"\n  require: \"distri/require:v0.5.2\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/packager.coffee": {
      "path": "test/packager.coffee",
      "content": "Packager = require(\"../packager\")\n\n{dependencies} = require(\"../pixie\")\n\ndescribe \"Packager\", ->\n  describe \"building a package\", ->\n    pkg = Packager.standAlone(PACKAGE)\n    relativePackagePath = Packager.relativePackagePath(PACKAGE)\n\n    it \"should have the correct manifest links\", ->\n      manifest = pkg[1].content\n\n      assert manifest.match(///^#{relativePackagePath}$///m)\n      assert manifest.match(/^index.html$/m)\n\n    it \"should have the correct script links\", ->\n      html = pkg[0].content\n\n      assert html.match ///\"#{relativePackagePath}\"///\n\n  it \"should fail to build if a resource doesn't exist\", (done) ->\n    Packager.collectDependencies(\n      notFound: \"distri/does_not_exist:v0.0.0\"\n    ).catch (message) ->\n      assert.equal message, \"Error: Failed to load package 'distri/does_not_exist:v0.0.0' from https://distri.github.io/does_not_exist/v0.0.0.json\"\n      done()\n    .catch done\n\n  it \"should be able to collect remote dependencies\", (done) ->\n    Packager.collectDependencies(dependencies)\n    .then (results) ->\n      assert.equal results.require.entryPoint, \"main\"\n      done()\n    , (errors) ->\n      throw errors\n\ndescribe \"http dependencies\", ->\n  it \"should be able to have http dependencies\", (done) ->\n    Packager.collectDependencies\n      httpRemote: \"https://s3.amazonaws.com/trinket/18894/data/00090d8da958fb538def3533dcf1ff3a85bc2054\"\n    .then (dependencies) ->\n      assert dependencies.httpRemote\n      console.log dependencies\n      done()\n\n  it \"should display an error message when file is not found\", (done) ->\n    Packager.collectDependencies\n      httpRemote: \"https://s3.amazonaws.com/trinket/18894/data/notfoundnotarealsha\"\n    .catch (message) ->\n      assert.equal message, \"404 Not Found: https://s3.amazonaws.com/trinket/18894/data/notfoundnotarealsha\"\n      done()\n\n  it \"should display an error message when domain is not legit\", (done) ->\n    Packager.collectDependencies\n      httpRemote: \"https://notfound.yolo.biz.info/duder.json\"\n    .catch (message) ->\n      assert.equal message, \"0 Aborted: https://notfound.yolo.biz.info/duder.json\"\n      done()\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "memoize_promise": {
      "path": "memoize_promise",
      "content": "(function() {\n  module.exports = function(fn) {\n    var cache, memoized;\n    cache = {};\n    return memoized = function(key) {\n      if (!cache[key]) {\n        cache[key] = fn.apply(this, arguments);\n        cache[key][\"catch\"](function() {\n          return delete cache[key];\n        });\n      }\n      return cache[key];\n      return memoized;\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "packager": {
      "path": "packager",
      "content": "(function() {\n  var Ajax, MemoizePromise, Packager, ajax, cacheManifest, dependencyScripts, fetchDependency, html, isDefault, jsonPath, launcherScript, makeScript, reject, relativePackagePath, startsWith;\n\n  MemoizePromise = require(\"./memoize_promise\");\n\n  jsonPath = function(_arg) {\n    var branch;\n    branch = _arg.repository.branch;\n    return \"\" + branch + \".json\";\n  };\n\n  isDefault = function(pkg) {\n    var branch, repository;\n    repository = pkg.repository;\n    branch = repository.branch;\n    return branch === repository.default_branch;\n  };\n\n  relativePackagePath = function(pkg) {\n    if (isDefault(pkg)) {\n      return jsonPath(pkg);\n    } else {\n      return \"../\" + (jsonPath(pkg));\n    }\n  };\n\n  launcherScript = function(pkg) {\n    return \"<script>\\n  xhr = new XMLHttpRequest;\\n  url = \" + (JSON.stringify(relativePackagePath(pkg))) + \";\\n  xhr.open(\\\"GET\\\", url, true);\\n  xhr.responseType = \\\"json\\\";\\n  xhr.onload = function() {\\n    (function(PACKAGE) {\\n      var src = \" + (JSON.stringify(PACKAGE.dependencies.require.distribution.main.content)) + \";\\n      var Require = new Function(\\\"PACKAGE\\\", \\\"return \\\" + src)({distribution: {main: {content: src}}});\\n      var require = Require.generateFor(PACKAGE);\\n      require('./' + PACKAGE.entryPoint);\\n    })(xhr.response)\\n  };\\n<\\/script>\";\n  };\n\n  startsWith = function(string, prefix) {\n    return string.match(RegExp(\"^\" + prefix));\n  };\n\n  reject = function(message) {\n    return Promise.reject(new Error(message));\n  };\n\n  html = function(pkg) {\n    return \"<!DOCTYPE html>\\n<html manifest=\\\"manifest.appcache?\" + (+(new Date)) + \"\\\">\\n  <head>\\n    <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n    \" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n  </head>\\n  <body>\\n    \" + (launcherScript(pkg)) + \"\\n  </body>\\n</html>\";\n  };\n\n  cacheManifest = function(pkg) {\n    return \"CACHE MANIFEST\\n# \" + (+(new Date)) + \"\\n\\nCACHE:\\nindex.html\\n\" + (relativePackagePath(pkg)) + \"\\n\" + ((pkg.remoteDependencies || []).join(\"\\n\")) + \"\\n\\nNETWORK:\\nhttps://*\\nhttp://*\\n*\";\n  };\n\n  makeScript = function(src) {\n    return \"<script src=\" + (JSON.stringify(src)) + \"><\\/script>\";\n  };\n\n  dependencyScripts = function(remoteDependencies) {\n    if (remoteDependencies == null) {\n      remoteDependencies = [];\n    }\n    return remoteDependencies.map(makeScript).join(\"\\n\");\n  };\n\n  fetchDependency = MemoizePromise(function(path) {\n    var branch, callback, match, repo, url, user;\n    if (typeof path === \"string\") {\n      if (startsWith(path, \"http\")) {\n        return ajax.getJSON(path)[\"catch\"](function(_arg) {\n          var message, response, status;\n          status = _arg.status, response = _arg.response;\n          switch (status) {\n            case 0:\n              message = \"Aborted\";\n              break;\n            case 404:\n              message = \"Not Found\";\n              break;\n            default:\n              throw new Error(response);\n          }\n          throw \"\" + status + \" \" + message + \": \" + path;\n        });\n      } else {\n        if ((match = path.match(/([^\\/]*)\\/([^\\:]*)\\:(.*)/))) {\n          callback = match[0], user = match[1], repo = match[2], branch = match[3];\n          url = \"https://\" + user + \".github.io/\" + repo + \"/\" + branch + \".json\";\n          return ajax.getJSON(url)[\"catch\"](function() {\n            throw new Error(\"Failed to load package '\" + path + \"' from \" + url);\n          });\n        } else {\n          return reject(\"Failed to parse repository info string \" + path + \", be sure it's in the\\nform `<user>/<repo>:<ref>` for example: `STRd6/issues:master`\\nor `STRd6/editor:v0.9.1`\");\n        }\n      }\n    } else {\n      return reject(\"Can only handle url string dependencies right now\");\n    }\n  });\n\n  Ajax = require(\"ajax\");\n\n  ajax = Ajax();\n\n  Packager = {\n    collectDependencies: function(dependencies) {\n      var names;\n      names = Object.keys(dependencies);\n      return Promise.all(names.map(function(name) {\n        var value;\n        value = dependencies[name];\n        return fetchDependency(value);\n      })).then(function(results) {\n        var bundledDependencies;\n        bundledDependencies = {};\n        names.forEach(function(name, i) {\n          return bundledDependencies[name] = results[i];\n        });\n        return bundledDependencies;\n      });\n    },\n    standAlone: function(pkg, files) {\n      var add, base, branch, json, repository;\n      if (files == null) {\n        files = [];\n      }\n      repository = pkg.repository;\n      branch = repository.branch;\n      if (isDefault(pkg)) {\n        base = \"\";\n      } else {\n        base = \"\" + branch + \"/\";\n      }\n      add = function(path, content) {\n        return files.push({\n          content: content,\n          mode: \"100644\",\n          path: path,\n          type: \"blob\"\n        });\n      };\n      add(\"\" + base + \"index.html\", html(pkg));\n      add(\"\" + base + \"manifest.appcache\", cacheManifest(pkg));\n      json = JSON.stringify(pkg, null, 2);\n      add(jsonPath(pkg), json);\n      return files;\n    },\n    testScripts: function(pkg) {\n      var distribution, testProgram;\n      distribution = pkg.distribution;\n      testProgram = Object.keys(distribution).filter(function(path) {\n        return path.match(/test\\//);\n      }).map(function(testPath) {\n        return \"require('./\" + testPath + \"')\";\n      }).join(\"\\n\");\n      return \"\" + (dependencyScripts(pkg.remoteDependencies)) + \"\\n<script>\\n  \" + (require('require').packageWrapper(pkg, testProgram)) + \"\\n<\\/script>\";\n    },\n    relativePackagePath: relativePackagePath\n  };\n\n  module.exports = Packager;\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.7.0-pre.0\",\"entryPoint\":\"packager\",\"dependencies\":{\"ajax\":\"distri/ajax:v0.1.4\",\"require\":\"distri/require:v0.5.2\"}};",
      "type": "blob"
    },
    "test/packager": {
      "path": "test/packager",
      "content": "(function() {\n  var Packager, dependencies;\n\n  Packager = require(\"../packager\");\n\n  dependencies = require(\"../pixie\").dependencies;\n\n  describe(\"Packager\", function() {\n    describe(\"building a package\", function() {\n      var pkg, relativePackagePath;\n      pkg = Packager.standAlone(PACKAGE);\n      relativePackagePath = Packager.relativePackagePath(PACKAGE);\n      it(\"should have the correct manifest links\", function() {\n        var manifest;\n        manifest = pkg[1].content;\n        assert(manifest.match(RegExp(\"^\" + relativePackagePath + \"$\", \"m\")));\n        return assert(manifest.match(/^index.html$/m));\n      });\n      return it(\"should have the correct script links\", function() {\n        var html;\n        html = pkg[0].content;\n        return assert(html.match(RegExp(\"\\\"\" + relativePackagePath + \"\\\"\")));\n      });\n    });\n    it(\"should fail to build if a resource doesn't exist\", function(done) {\n      return Packager.collectDependencies({\n        notFound: \"distri/does_not_exist:v0.0.0\"\n      })[\"catch\"](function(message) {\n        assert.equal(message, \"Error: Failed to load package 'distri/does_not_exist:v0.0.0' from https://distri.github.io/does_not_exist/v0.0.0.json\");\n        return done();\n      })[\"catch\"](done);\n    });\n    return it(\"should be able to collect remote dependencies\", function(done) {\n      return Packager.collectDependencies(dependencies).then(function(results) {\n        assert.equal(results.require.entryPoint, \"main\");\n        return done();\n      }, function(errors) {\n        throw errors;\n      });\n    });\n  });\n\n  describe(\"http dependencies\", function() {\n    it(\"should be able to have http dependencies\", function(done) {\n      return Packager.collectDependencies({\n        httpRemote: \"https://s3.amazonaws.com/trinket/18894/data/00090d8da958fb538def3533dcf1ff3a85bc2054\"\n      }).then(function(dependencies) {\n        assert(dependencies.httpRemote);\n        console.log(dependencies);\n        return done();\n      });\n    });\n    it(\"should display an error message when file is not found\", function(done) {\n      return Packager.collectDependencies({\n        httpRemote: \"https://s3.amazonaws.com/trinket/18894/data/notfoundnotarealsha\"\n      })[\"catch\"](function(message) {\n        assert.equal(message, \"404 Not Found: https://s3.amazonaws.com/trinket/18894/data/notfoundnotarealsha\");\n        return done();\n      });\n    });\n    return it(\"should display an error message when domain is not legit\", function(done) {\n      return Packager.collectDependencies({\n        httpRemote: \"https://notfound.yolo.biz.info/duder.json\"\n      })[\"catch\"](function(message) {\n        assert.equal(message, \"0 Aborted: https://notfound.yolo.biz.info/duder.json\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "version": "0.7.0-pre.0",
  "entryPoint": "packager",
  "repository": {
    "branch": "remove-jsonp",
    "default_branch": "master",
    "full_name": "distri/packager",
    "homepage": null,
    "description": "Create standalone build products for web packages",
    "html_url": "https://github.com/distri/packager",
    "url": "https://api.github.com/repos/distri/packager",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "ajax": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2016 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "# ajax\n\nA Promise returning wrapper for XMLHttpRequest\n\nThis aims to be a very small and very direct wrapper for XMLHttpRequest. We\nreturn a native promise and configure the requets via an options object.\n\n\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "{extend, defaults} = require \"./util\"\n\nmodule.exports = ->\n  ajax = (options={}) ->\n    {data, headers, method, overrideMimeType, password, url, responseType, timeout, user, withCredentials} = options\n    data ?= \"\"\n    method ?= \"GET\"\n    password ?= \"\"\n    responseType ?= \"\"\n    timeout ?= 0\n    user ?= \"\"\n    withCredentials ?= false\n\n    new Promise (resolve, reject) ->\n      xhr = new XMLHttpRequest()\n      xhr.open(method, url, true, user, password)\n      xhr.responseType = responseType\n      xhr.timeout = timeout\n      xhr.withCredentialls = withCredentials\n\n      if headers\n        Object.keys(headers).forEach (header) ->\n          value = headers[header]\n          xhr.setRequestHeader header, value\n\n      if overrideMimeType\n        xhr.overrideMimeType overrideMimeType\n\n      xhr.onload = (e) ->\n        if (200 <= this.status < 300) or this.status is 304\n          resolve this.response\n          complete e, xhr, options\n        else\n          reject xhr\n          complete e, xhr, options\n\n      xhr.onerror = (e) ->\n        reject xhr\n        complete e, xhr, options\n\n      xhr.send(data)\n\n  complete = (args...) ->\n    completeHandlers.forEach (handler) ->\n      handler args...\n\n  configure = (optionDefaults) ->\n    (url, options={}) ->\n      if typeof url is \"object\"\n        options = url\n      else\n        options.url = url\n\n      defaults options, optionDefaults\n\n      ajax(options)\n\n  completeHandlers = []\n\n  extend ajax,\n    ajax: configure {}\n    complete: (handler) ->\n      completeHandlers.push handler\n\n    getJSON: configure\n      responseType: \"json\"\n\n    getBlob: configure\n      responseType: \"blob\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.1.4\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/test.coffee": {
          "path": "test/test.coffee",
          "content": "Ajax = require \"../main\"\n\ndescribe \"Ajax\", ->\n  it \"should getJSON\", (done) ->\n    ajax = Ajax()\n\n    ajax\n      url: \"https://api.github.com/users\"\n      responseType: \"json\"\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n\n  it \"should have complete handlers\", (done) ->\n    ajax = Ajax()\n\n    ajax.complete (e, xhr, options) ->\n      done()\n\n    ajax.getJSON(\"https://api.github.com/users\")\n\n  it \"should work with options only\", (done) ->\n    ajax = Ajax()\n\n    ajax.getJSON(url: \"https://api.github.com/users\")\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n",
          "mode": "100644",
          "type": "blob"
        },
        "util.coffee": {
          "path": "util.coffee",
          "content": "module.exports =\n  defaults: (target, objects...) ->\n    for object in objects\n      for name of object\n        unless target.hasOwnProperty(name)\n          target[name] = object[name]\n\n    return target\n\n  extend: (target, sources...) ->\n    for source in sources\n      for name of source\n        target[name] = source[name]\n\n    return target\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var defaults, extend, _ref,\n    __slice = [].slice;\n\n  _ref = require(\"./util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  module.exports = function() {\n    var ajax, complete, completeHandlers, configure;\n    ajax = function(options) {\n      var data, headers, method, overrideMimeType, password, responseType, timeout, url, user, withCredentials;\n      if (options == null) {\n        options = {};\n      }\n      data = options.data, headers = options.headers, method = options.method, overrideMimeType = options.overrideMimeType, password = options.password, url = options.url, responseType = options.responseType, timeout = options.timeout, user = options.user, withCredentials = options.withCredentials;\n      if (data == null) {\n        data = \"\";\n      }\n      if (method == null) {\n        method = \"GET\";\n      }\n      if (password == null) {\n        password = \"\";\n      }\n      if (responseType == null) {\n        responseType = \"\";\n      }\n      if (timeout == null) {\n        timeout = 0;\n      }\n      if (user == null) {\n        user = \"\";\n      }\n      if (withCredentials == null) {\n        withCredentials = false;\n      }\n      return new Promise(function(resolve, reject) {\n        var xhr;\n        xhr = new XMLHttpRequest();\n        xhr.open(method, url, true, user, password);\n        xhr.responseType = responseType;\n        xhr.timeout = timeout;\n        xhr.withCredentialls = withCredentials;\n        if (headers) {\n          Object.keys(headers).forEach(function(header) {\n            var value;\n            value = headers[header];\n            return xhr.setRequestHeader(header, value);\n          });\n        }\n        if (overrideMimeType) {\n          xhr.overrideMimeType(overrideMimeType);\n        }\n        xhr.onload = function(e) {\n          var _ref1;\n          if (((200 <= (_ref1 = this.status) && _ref1 < 300)) || this.status === 304) {\n            resolve(this.response);\n            return complete(e, xhr, options);\n          } else {\n            reject(xhr);\n            return complete(e, xhr, options);\n          }\n        };\n        xhr.onerror = function(e) {\n          reject(xhr);\n          return complete(e, xhr, options);\n        };\n        return xhr.send(data);\n      });\n    };\n    complete = function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return completeHandlers.forEach(function(handler) {\n        return handler.apply(null, args);\n      });\n    };\n    configure = function(optionDefaults) {\n      return function(url, options) {\n        if (options == null) {\n          options = {};\n        }\n        if (typeof url === \"object\") {\n          options = url;\n        } else {\n          options.url = url;\n        }\n        defaults(options, optionDefaults);\n        return ajax(options);\n      };\n    };\n    completeHandlers = [];\n    return extend(ajax, {\n      ajax: configure({}),\n      complete: function(handler) {\n        return completeHandlers.push(handler);\n      },\n      getJSON: configure({\n        responseType: \"json\"\n      }),\n      getBlob: configure({\n        responseType: \"blob\"\n      })\n    });\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.1.4\"};",
          "type": "blob"
        },
        "test/test": {
          "path": "test/test",
          "content": "(function() {\n  var Ajax;\n\n  Ajax = require(\"../main\");\n\n  describe(\"Ajax\", function() {\n    it(\"should getJSON\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax({\n        url: \"https://api.github.com/users\",\n        responseType: \"json\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n    it(\"should have complete handlers\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      ajax.complete(function(e, xhr, options) {\n        return done();\n      });\n      return ajax.getJSON(\"https://api.github.com/users\");\n    });\n    return it(\"should work with options only\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax.getJSON({\n        url: \"https://api.github.com/users\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        },
        "util": {
          "path": "util",
          "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/v0.4.2/"
      },
      "version": "0.1.4",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.1.4",
        "default_branch": "master",
        "full_name": "distri/ajax",
        "homepage": null,
        "description": "Promise returning Ajax lib",
        "html_url": "https://github.com/distri/ajax",
        "url": "https://api.github.com/repos/distri/ajax",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    },
    "require": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "require\n=======\n\nRequire system for self replicating client side apps\n\n[Docs](http://distri.github.io/require/docs)\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee.md": {
          "path": "main.coffee.md",
          "content": "Require\n=======\n\nA Node.js compatible require implementation for pure client side apps.\n\nEach file is a module. Modules are responsible for exporting an object. Unlike\ntraditional client side JavaScript, Ruby, or other common languages the module\nis not responsible for naming its product in the context of the requirer. This\nmaintains encapsulation because it is impossible from within a module to know\nwhat external name would be correct to prevent errors of composition in all\npossible uses.\n\nUses\n----\n\nFrom a module require another module in the same package.\n\n>     require \"./soup\"\n\nRequire a module in the parent directory\n\n>     require \"../nuts\"\n\nRequire a module from the root directory in the same package.\n\nNOTE: This could behave slightly differently under Node.js if your package does\nnot have it's own isolated filesystem.\n\n>     require \"/silence\"\n\nFrom a module within a package, require a dependent package.\n\n>     require \"console\"\n\nThe dependency could be delcared in pixie.cson as follows:\n\n>     dependencies:\n>       console: \"http://strd6.github.io/console/v1.2.2.json\"\n\nYou can require a package directly from its JSON representation as well.\n\n>     $.getJSON(packageURL)\n>     .then (pkg) ->\n>       require pkg\n\nImplementation\n--------------\n\nFile separator is '/'\n\n    fileSeparator = '/'\n\nIn the browser `global` is `self`.\n\n    global = self\n\nDefault entry point\n\n    defaultEntryPoint = \"main\"\n\nA sentinal against circular requires.\n\n    circularGuard = {}\n\nA top-level module so that all other modules won't have to be orphans.\n\n    rootModule =\n      path: \"\"\n\nRequire a module given a path within a package. Each file is its own separate\nmodule. An application is composed of packages.\n\n    loadPath = (parentModule, pkg, path) ->\n      if startsWith(path, '/')\n        localPath = []\n      else\n        localPath = parentModule.path.split(fileSeparator)\n\n      normalizedPath = normalizePath(path, localPath)\n\n      cache = cacheFor(pkg)\n\n      if module = cache[normalizedPath]\n        if module is circularGuard\n          throw \"Circular dependency detected when requiring #{normalizedPath}\"\n      else\n        cache[normalizedPath] = circularGuard\n\n        try\n          cache[normalizedPath] = module = loadModule(pkg, normalizedPath)\n        finally\n          delete cache[normalizedPath] if cache[normalizedPath] is circularGuard\n\n      return module.exports\n\nTo normalize the path we convert local paths to a standard form that does not\ncontain an references to current or parent directories.\n\n    normalizePath = (path, base=[]) ->\n      base = base.concat path.split(fileSeparator)\n      result = []\n\nChew up all the pieces into a standardized path.\n\n      while base.length\n        switch piece = base.shift()\n          when \"..\"\n            result.pop()\n          when \"\", \".\"\n            # Skip\n          else\n            result.push(piece)\n\n      return result.join(fileSeparator)\n\n`loadPackage` Loads a dependent package at that packages entry point.\n\n    loadPackage = (pkg) ->\n      path = pkg.entryPoint or defaultEntryPoint\n\n      loadPath(rootModule, pkg, path)\n\nLoad a file from within a package.\n\n    loadModule = (pkg, path) ->\n      unless (file = pkg.distribution[path])\n        throw \"Could not find file at #{path} in #{pkg.name}\"\n\n      unless (content = file.content)?\n        throw \"Malformed package. No content for file at #{path} in #{pkg.name}\"\n\n      program = annotateSourceURL content, pkg, path\n      dirname = path.split(fileSeparator)[0...-1].join(fileSeparator)\n\n      module =\n        path: dirname\n        exports: {}\n\nThis external context provides some variable that modules have access to.\n\nA `require` function is exposed to modules so they may require other modules.\n\nAdditional properties such as a reference to the global object and some metadata\nare also exposed.\n\n      context =\n        require: generateRequireFn(pkg, module)\n        global: global\n        module: module\n        exports: module.exports\n        PACKAGE: pkg\n        __filename: path\n        __dirname: dirname\n\n      args = Object.keys(context)\n      values = args.map (name) -> context[name]\n\nExecute the program within the module and given context.\n\n      Function(args..., program).apply(module, values)\n\n      return module\n\nHelper to detect if a given path is a package.\n\n    isPackage = (path) ->\n      if !(startsWith(path, fileSeparator) or\n        startsWith(path, \".#{fileSeparator}\") or\n        startsWith(path, \"..#{fileSeparator}\")\n      )\n        path.split(fileSeparator)[0]\n      else\n        false\n\nGenerate a require function for a given module in a package.\n\nIf we are loading a package in another module then we strip out the module part\nof the name and use the `rootModule` rather than the local module we came from.\nThat way our local path won't affect the lookup path in another package.\n\nLoading a module within our package, uses the requiring module as a parent for\nlocal path resolution.\n\n    generateRequireFn = (pkg, module=rootModule) ->\n      pkg.name ?= \"ROOT\"\n      pkg.scopedName ?= \"ROOT\"\n\n      fn = (path) ->\n        if typeof path is \"object\"\n          loadPackage(path)\n        else if isPackage(path)\n          unless otherPackage = pkg.dependencies[path]\n            throw \"Package: #{path} not found.\"\n\n          otherPackage.name ?= path\n          otherPackage.scopedName ?= \"#{pkg.scopedName}:#{path}\"\n\n          loadPackage(otherPackage)\n        else\n          loadPath(module, pkg, path)\n\n      fn.packageWrapper = publicAPI.packageWrapper\n      fn.executePackageWrapper = publicAPI.executePackageWrapper\n\n      return fn\n\nBecause we can't actually `require('require')` we need to export it a little\ndifferently.\n\n    publicAPI =\n      generateFor: generateRequireFn\n\nWrap a package as a string that will bootstrap `require` and execute the package.\nThis can be used for generating standalone HTML pages, scripts, and tests.\n\n      packageWrapper: (pkg, code) ->\n        \"\"\"\n          ;(function(PACKAGE) {\n            var src = #{JSON.stringify(PACKAGE.distribution.main.content)};\n            var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n            var require = Require.generateFor(PACKAGE);\n            #{code};\n          })(#{JSON.stringify(pkg, null, 2)});\n        \"\"\"\n\nWrap a package as a string that will execute its entry point.\n\n      executePackageWrapper: (pkg) ->\n        publicAPI.packageWrapper pkg, \"require('./#{pkg.entryPoint}')\"\n\nRequire a package directly.\n\n      loadPackage: loadPackage\n\n    if exports?\n      module.exports = publicAPI\n    else\n      global.Require = publicAPI\n\nNotes\n-----\n\nWe have to use `pkg` as a variable name because `package` is a reserved word.\n\nNode needs to check file extensions, but because we only load compiled products\nwe never have extensions in our path.\n\nSo while Node may need to check for either `path/somefile.js` or `path/somefile.coffee`\nthat will already have been resolved for us and we will only check `path/somefile`\n\nCircular dependencies are not allowed and raise an exception when detected.\n\nHelpers\n-------\n\nDetect if a string starts with a given prefix.\n\n    startsWith = (string, prefix) ->\n      string.lastIndexOf(prefix, 0) is 0\n\nCreates a cache for modules within a package. It uses `defineProperty` so that\nthe cache doesn't end up being enumerated or serialized to json.\n\n    cacheFor = (pkg) ->\n      return pkg.cache if pkg.cache\n\n      Object.defineProperty pkg, \"cache\",\n        value: {}\n\n      return pkg.cache\n\nAnnotate a program with a source url so we can debug in Chrome's dev tools.\n\n    annotateSourceURL = (program, pkg, path) ->\n      \"\"\"\n        #{program}\n        //# sourceURL=#{pkg.scopedName}/#{path}\n      \"\"\"\n\nReturn value for inserting into function for embedded windows.\n\n    return publicAPI\n\nDefinitions\n-----------\n\n### Module\n\nA module is a file.\n\n### Package\n\nA package is an aggregation of modules. A package is a json object with the\nfollowing properties:\n\n- `distribution` An object whose keys are paths and properties are `fileData`\n- `entryPoint` Path to the primary module that requiring this package will require.\n- `dependencies` An object whose keys are names and whose values are packages.\n\nIt may have additional properties such as `source`, `repository`, and `docs`.\n\n### Application\n\nAn application is a package which has an `entryPoint` and may have dependencies.\nAdditionally an application's dependencies may have dependencies. Dependencies\nmust be bundled with the package.\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.5.2\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/browserified.js": {
          "path": "samples/browserified.js",
          "content": "!function(e){if(\"object\"==typeof exports)module.exports=e();else if(\"function\"==typeof define&&define.amd)define(e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.Test=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error(\"Cannot find module '\"+o+\"'\")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){\nmodule.exports = 'coolio';\n\n},{}]},{},[1])\n(1)\n});\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/circular.coffee": {
          "path": "samples/circular.coffee",
          "content": "# This test file illustrates a circular requirement and should throw an error.\n\nrequire \"./circular\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/random.coffee": {
          "path": "samples/random.coffee",
          "content": "# Returns a random value, used for testing caching\n\nmodule.exports = Math.random()\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/terminal.coffee": {
          "path": "samples/terminal.coffee",
          "content": "# A test file for requiring a file that has no dependencies. It should succeed.\n\nexports.something = true\n",
          "mode": "100644",
          "type": "blob"
        },
        "samples/throws.coffee": {
          "path": "samples/throws.coffee",
          "content": "# A test file that throws an error.\n\nthrow \"yolo\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/require.coffee": {
          "path": "test/require.coffee",
          "content": "\n# Load our latest require code for testing\n# NOTE: This causes the root for relative requires to be at the root dir, not the test dir\nlatestRequire = require('/main').generateFor(PACKAGE)\n\ndescribe \"PACKAGE\", ->\n  it \"should be named 'ROOT'\", ->\n    assert.equal PACKAGE.name, \"ROOT\"\n\ndescribe \"require\", ->\n  it \"should not exist globally\", ->\n    assert !global.require\n\n  it \"should be able to require a file that exists with a relative path\", ->\n    assert latestRequire('/samples/terminal')\n\n  it \"should get whatever the file exports\", ->\n    assert latestRequire('/samples/terminal').something\n\n  it \"should not get something the file doesn't export\", ->\n    assert !latestRequire('/samples/terminal').something2\n\n  it \"should throw a descriptive error when requring circular dependencies\", ->\n    assert.throws ->\n      latestRequire('/samples/circular')\n    , /circular/i\n\n  it \"should throw a descriptive error when requiring a package that doesn't exist\", ->\n    assert.throws ->\n      latestRequire \"does_not_exist\"\n    , /not found/i\n\n  it \"should throw a descriptive error when requiring a relative path that doesn't exist\", ->\n    assert.throws ->\n      latestRequire \"/does_not_exist\"\n    , /Could not find file/i\n\n  it \"should recover gracefully enough from requiring files that throw errors\", ->\n    assert.throws ->\n      latestRequire \"/samples/throws\"\n\n    assert.throws ->\n      latestRequire \"/samples/throws\"\n    , (err) ->\n      !/circular/i.test err\n\n  it \"should cache modules\", ->\n    result = latestRequire(\"/samples/random\")\n\n    assert.equal latestRequire(\"/samples/random\"), result\n\n  it \"should be able to require a JSON package object\", ->\n    SAMPLE_PACKAGE =\n      entryPoint: \"main\"\n      distribution:\n        main:\n          content: \"module.exports = require('./other')\"\n        other:\n          content: \"module.exports = 'TEST'\"\n\n    result = latestRequire SAMPLE_PACKAGE\n\n    assert.equal \"TEST\", result\n\n  it \"should be able to require something packaged with browserify\", ->\n    assert.equal latestRequire(\"/samples/browserified\"), \"coolio\"\n\ndescribe \"package wrapper\", ->\n  it \"should be able to generate a package wrapper\", ->\n    pkgString = latestRequire.packageWrapper(PACKAGE, \"window.r = Require;\")\n    assert pkgString\n\n  it \"should be able to execute code in the package context\", ->\n    code = latestRequire.packageWrapper(PACKAGE, \"window.test = require.packageWrapper(PACKAGE, 'alert(\\\"heyy\\\")');\")\n    Function(code)()\n    assert window.test\n    delete window.test\n\ndescribe \"public API\", ->\n  it \"should be able to require a JSON package directly\", ->\n    assert require('/main').loadPackage(PACKAGE).loadPackage\n\ndescribe \"module context\", ->\n  it \"should know __dirname\", ->\n    assert.equal \"test\", __dirname\n\n  it \"should know __filename\", ->\n    assert __filename\n\n  it \"should know its package\", ->\n    assert PACKAGE\n\ndescribe \"malformed package\", ->\n  malformedPackage =\n    distribution:\n      yolo: \"No content!\"\n\n  it \"should throw an error when attempting to require a malformed file in a package distribution\", ->\n    r = require('/main').generateFor(malformedPackage)\n\n    assert.throws ->\n      r.require \"yolo\"\n    , (err) ->\n      !/malformed/i.test err\n\ndescribe \"dependent packages\", ->\n  PACKAGE.dependencies[\"test-package\"] =\n    distribution:\n      main:\n        content: \"module.exports = PACKAGE.name\"\n\n  PACKAGE.dependencies[\"strange/name\"] =\n    distribution:\n      main:\n        content: \"\"\n\n  it \"should raise an error when requiring a package that doesn't exist\", ->\n    assert.throws ->\n      latestRequire \"nonexistent\"\n    , (err) ->\n      /nonexistent/i.test err\n\n  it \"should be able to require a package that exists\", ->\n    assert latestRequire(\"test-package\")\n\n  it \"Dependent packages should know their names when required\", ->\n    assert.equal latestRequire(\"test-package\"), \"test-package\"\n\n  it \"should be able to require by pretty much any name\", ->\n    assert latestRequire(\"strange/name\")\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "(function() {\n  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,\n    __slice = [].slice;\n\n  fileSeparator = '/';\n\n  global = self;\n\n  defaultEntryPoint = \"main\";\n\n  circularGuard = {};\n\n  rootModule = {\n    path: \"\"\n  };\n\n  loadPath = function(parentModule, pkg, path) {\n    var cache, localPath, module, normalizedPath;\n    if (startsWith(path, '/')) {\n      localPath = [];\n    } else {\n      localPath = parentModule.path.split(fileSeparator);\n    }\n    normalizedPath = normalizePath(path, localPath);\n    cache = cacheFor(pkg);\n    if (module = cache[normalizedPath]) {\n      if (module === circularGuard) {\n        throw \"Circular dependency detected when requiring \" + normalizedPath;\n      }\n    } else {\n      cache[normalizedPath] = circularGuard;\n      try {\n        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);\n      } finally {\n        if (cache[normalizedPath] === circularGuard) {\n          delete cache[normalizedPath];\n        }\n      }\n    }\n    return module.exports;\n  };\n\n  normalizePath = function(path, base) {\n    var piece, result;\n    if (base == null) {\n      base = [];\n    }\n    base = base.concat(path.split(fileSeparator));\n    result = [];\n    while (base.length) {\n      switch (piece = base.shift()) {\n        case \"..\":\n          result.pop();\n          break;\n        case \"\":\n        case \".\":\n          break;\n        default:\n          result.push(piece);\n      }\n    }\n    return result.join(fileSeparator);\n  };\n\n  loadPackage = function(pkg) {\n    var path;\n    path = pkg.entryPoint || defaultEntryPoint;\n    return loadPath(rootModule, pkg, path);\n  };\n\n  loadModule = function(pkg, path) {\n    var args, content, context, dirname, file, module, program, values;\n    if (!(file = pkg.distribution[path])) {\n      throw \"Could not find file at \" + path + \" in \" + pkg.name;\n    }\n    if ((content = file.content) == null) {\n      throw \"Malformed package. No content for file at \" + path + \" in \" + pkg.name;\n    }\n    program = annotateSourceURL(content, pkg, path);\n    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);\n    module = {\n      path: dirname,\n      exports: {}\n    };\n    context = {\n      require: generateRequireFn(pkg, module),\n      global: global,\n      module: module,\n      exports: module.exports,\n      PACKAGE: pkg,\n      __filename: path,\n      __dirname: dirname\n    };\n    args = Object.keys(context);\n    values = args.map(function(name) {\n      return context[name];\n    });\n    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);\n    return module;\n  };\n\n  isPackage = function(path) {\n    if (!(startsWith(path, fileSeparator) || startsWith(path, \".\" + fileSeparator) || startsWith(path, \"..\" + fileSeparator))) {\n      return path.split(fileSeparator)[0];\n    } else {\n      return false;\n    }\n  };\n\n  generateRequireFn = function(pkg, module) {\n    var fn;\n    if (module == null) {\n      module = rootModule;\n    }\n    if (pkg.name == null) {\n      pkg.name = \"ROOT\";\n    }\n    if (pkg.scopedName == null) {\n      pkg.scopedName = \"ROOT\";\n    }\n    fn = function(path) {\n      var otherPackage;\n      if (typeof path === \"object\") {\n        return loadPackage(path);\n      } else if (isPackage(path)) {\n        if (!(otherPackage = pkg.dependencies[path])) {\n          throw \"Package: \" + path + \" not found.\";\n        }\n        if (otherPackage.name == null) {\n          otherPackage.name = path;\n        }\n        if (otherPackage.scopedName == null) {\n          otherPackage.scopedName = \"\" + pkg.scopedName + \":\" + path;\n        }\n        return loadPackage(otherPackage);\n      } else {\n        return loadPath(module, pkg, path);\n      }\n    };\n    fn.packageWrapper = publicAPI.packageWrapper;\n    fn.executePackageWrapper = publicAPI.executePackageWrapper;\n    return fn;\n  };\n\n  publicAPI = {\n    generateFor: generateRequireFn,\n    packageWrapper: function(pkg, code) {\n      return \";(function(PACKAGE) {\\n  var src = \" + (JSON.stringify(PACKAGE.distribution.main.content)) + \";\\n  var Require = new Function(\\\"PACKAGE\\\", \\\"return \\\" + src)({distribution: {main: {content: src}}});\\n  var require = Require.generateFor(PACKAGE);\\n  \" + code + \";\\n})(\" + (JSON.stringify(pkg, null, 2)) + \");\";\n    },\n    executePackageWrapper: function(pkg) {\n      return publicAPI.packageWrapper(pkg, \"require('./\" + pkg.entryPoint + \"')\");\n    },\n    loadPackage: loadPackage\n  };\n\n  if (typeof exports !== \"undefined\" && exports !== null) {\n    module.exports = publicAPI;\n  } else {\n    global.Require = publicAPI;\n  }\n\n  startsWith = function(string, prefix) {\n    return string.lastIndexOf(prefix, 0) === 0;\n  };\n\n  cacheFor = function(pkg) {\n    if (pkg.cache) {\n      return pkg.cache;\n    }\n    Object.defineProperty(pkg, \"cache\", {\n      value: {}\n    });\n    return pkg.cache;\n  };\n\n  annotateSourceURL = function(program, pkg, path) {\n    return \"\" + program + \"\\n//# sourceURL=\" + pkg.scopedName + \"/\" + path;\n  };\n\n  return publicAPI;\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.5.2\"};",
          "type": "blob"
        },
        "samples/browserified": {
          "path": "samples/browserified",
          "content": "!function(e){if(\"object\"==typeof exports)module.exports=e();else if(\"function\"==typeof define&&define.amd)define(e);else{var f;\"undefined\"!=typeof window?f=window:\"undefined\"!=typeof global?f=global:\"undefined\"!=typeof self&&(f=self),f.Test=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error(\"Cannot find module '\"+o+\"'\")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){\nmodule.exports = 'coolio';\n\n},{}]},{},[1])\n(1)\n});\n",
          "type": "blob"
        },
        "samples/circular": {
          "path": "samples/circular",
          "content": "(function() {\n  require(\"./circular\");\n\n}).call(this);\n",
          "type": "blob"
        },
        "samples/random": {
          "path": "samples/random",
          "content": "(function() {\n  module.exports = Math.random();\n\n}).call(this);\n",
          "type": "blob"
        },
        "samples/terminal": {
          "path": "samples/terminal",
          "content": "(function() {\n  exports.something = true;\n\n}).call(this);\n",
          "type": "blob"
        },
        "samples/throws": {
          "path": "samples/throws",
          "content": "(function() {\n  throw \"yolo\";\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/require": {
          "path": "test/require",
          "content": "(function() {\n  var latestRequire;\n\n  latestRequire = require('/main').generateFor(PACKAGE);\n\n  describe(\"PACKAGE\", function() {\n    return it(\"should be named 'ROOT'\", function() {\n      return assert.equal(PACKAGE.name, \"ROOT\");\n    });\n  });\n\n  describe(\"require\", function() {\n    it(\"should not exist globally\", function() {\n      return assert(!global.require);\n    });\n    it(\"should be able to require a file that exists with a relative path\", function() {\n      return assert(latestRequire('/samples/terminal'));\n    });\n    it(\"should get whatever the file exports\", function() {\n      return assert(latestRequire('/samples/terminal').something);\n    });\n    it(\"should not get something the file doesn't export\", function() {\n      return assert(!latestRequire('/samples/terminal').something2);\n    });\n    it(\"should throw a descriptive error when requring circular dependencies\", function() {\n      return assert.throws(function() {\n        return latestRequire('/samples/circular');\n      }, /circular/i);\n    });\n    it(\"should throw a descriptive error when requiring a package that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"does_not_exist\");\n      }, /not found/i);\n    });\n    it(\"should throw a descriptive error when requiring a relative path that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"/does_not_exist\");\n      }, /Could not find file/i);\n    });\n    it(\"should recover gracefully enough from requiring files that throw errors\", function() {\n      assert.throws(function() {\n        return latestRequire(\"/samples/throws\");\n      });\n      return assert.throws(function() {\n        return latestRequire(\"/samples/throws\");\n      }, function(err) {\n        return !/circular/i.test(err);\n      });\n    });\n    it(\"should cache modules\", function() {\n      var result;\n      result = latestRequire(\"/samples/random\");\n      return assert.equal(latestRequire(\"/samples/random\"), result);\n    });\n    it(\"should be able to require a JSON package object\", function() {\n      var SAMPLE_PACKAGE, result;\n      SAMPLE_PACKAGE = {\n        entryPoint: \"main\",\n        distribution: {\n          main: {\n            content: \"module.exports = require('./other')\"\n          },\n          other: {\n            content: \"module.exports = 'TEST'\"\n          }\n        }\n      };\n      result = latestRequire(SAMPLE_PACKAGE);\n      return assert.equal(\"TEST\", result);\n    });\n    return it(\"should be able to require something packaged with browserify\", function() {\n      return assert.equal(latestRequire(\"/samples/browserified\"), \"coolio\");\n    });\n  });\n\n  describe(\"package wrapper\", function() {\n    it(\"should be able to generate a package wrapper\", function() {\n      var pkgString;\n      pkgString = latestRequire.packageWrapper(PACKAGE, \"window.r = Require;\");\n      return assert(pkgString);\n    });\n    return it(\"should be able to execute code in the package context\", function() {\n      var code;\n      code = latestRequire.packageWrapper(PACKAGE, \"window.test = require.packageWrapper(PACKAGE, 'alert(\\\"heyy\\\")');\");\n      Function(code)();\n      assert(window.test);\n      return delete window.test;\n    });\n  });\n\n  describe(\"public API\", function() {\n    return it(\"should be able to require a JSON package directly\", function() {\n      return assert(require('/main').loadPackage(PACKAGE).loadPackage);\n    });\n  });\n\n  describe(\"module context\", function() {\n    it(\"should know __dirname\", function() {\n      return assert.equal(\"test\", __dirname);\n    });\n    it(\"should know __filename\", function() {\n      return assert(__filename);\n    });\n    return it(\"should know its package\", function() {\n      return assert(PACKAGE);\n    });\n  });\n\n  describe(\"malformed package\", function() {\n    var malformedPackage;\n    malformedPackage = {\n      distribution: {\n        yolo: \"No content!\"\n      }\n    };\n    return it(\"should throw an error when attempting to require a malformed file in a package distribution\", function() {\n      var r;\n      r = require('/main').generateFor(malformedPackage);\n      return assert.throws(function() {\n        return r.require(\"yolo\");\n      }, function(err) {\n        return !/malformed/i.test(err);\n      });\n    });\n  });\n\n  describe(\"dependent packages\", function() {\n    PACKAGE.dependencies[\"test-package\"] = {\n      distribution: {\n        main: {\n          content: \"module.exports = PACKAGE.name\"\n        }\n      }\n    };\n    PACKAGE.dependencies[\"strange/name\"] = {\n      distribution: {\n        main: {\n          content: \"\"\n        }\n      }\n    };\n    it(\"should raise an error when requiring a package that doesn't exist\", function() {\n      return assert.throws(function() {\n        return latestRequire(\"nonexistent\");\n      }, function(err) {\n        return /nonexistent/i.test(err);\n      });\n    });\n    it(\"should be able to require a package that exists\", function() {\n      return assert(latestRequire(\"test-package\"));\n    });\n    it(\"Dependent packages should know their names when required\", function() {\n      return assert.equal(latestRequire(\"test-package\"), \"test-package\");\n    });\n    return it(\"should be able to require by pretty much any name\", function() {\n      return assert(latestRequire(\"strange/name\"));\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "version": "0.5.2",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.5.2",
        "default_branch": "master",
        "full_name": "distri/require",
        "homepage": null,
        "description": "Require system for self replicating client side apps",
        "html_url": "https://github.com/distri/require",
        "url": "https://api.github.com/repos/distri/require",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});