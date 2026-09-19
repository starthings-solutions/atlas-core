import assert from "node:assert/strict";
import test from "node:test";

import {
  bindHost,
  clientHost,
  defaultPort,
  extraAllowedHosts,
  hostForUrl,
  LOOPBACK_HOST,
  linkHost,
} from "../src/paths.js";

test("Atlas Core owns a distinct default port", () => {
  const previous = process.env.ATLAS_CORE_PORT;
  delete process.env.ATLAS_CORE_PORT;
  try {
    assert.equal(defaultPort(), 4397);
  } finally {
    if (previous === undefined) delete process.env.ATLAS_CORE_PORT;
    else process.env.ATLAS_CORE_PORT = previous;
  }
});

test("bindHost defaults to loopback and honors ATLAS_CORE_HOST", () => {
  assert.equal(bindHost({}), LOOPBACK_HOST);
  assert.equal(bindHost({ ATLAS_CORE_HOST: "" }), LOOPBACK_HOST);
  assert.equal(bindHost({ ATLAS_CORE_HOST: "  " }), LOOPBACK_HOST);
  assert.equal(bindHost({ ATLAS_CORE_HOST: "100.64.0.1" }), "100.64.0.1");
  assert.equal(bindHost({ ATLAS_CORE_HOST: " 0.0.0.0 " }), "0.0.0.0");
});

test("clientHost dials the concrete primary listener for wildcard binds", () => {
  assert.equal(clientHost({}), LOOPBACK_HOST);
  assert.equal(clientHost({ ATLAS_CORE_HOST: "100.64.0.1" }), "100.64.0.1");
  assert.equal(clientHost({ ATLAS_CORE_HOST: "0.0.0.0" }), LOOPBACK_HOST);
  assert.equal(clientHost({ ATLAS_CORE_HOST: "::" }), LOOPBACK_HOST);
  assert.equal(clientHost({ ATLAS_CORE_HOST: "[::]" }), LOOPBACK_HOST);
  assert.equal(clientHost({ ATLAS_CORE_HOST: "0:0:0:0:0:0:0:0" }), LOOPBACK_HOST);
  assert.equal(clientHost({ ATLAS_CORE_HOST: "[0:0:0:0:0:0:0:0]" }), LOOPBACK_HOST);
  assert.equal(clientHost({ ATLAS_CORE_HOST: "::ffff:0.0.0.0" }), LOOPBACK_HOST);
});

test("extraAllowedHosts parses the whitespace-separated opt-in list", () => {
  assert.deepEqual(extraAllowedHosts({}), []);
  assert.deepEqual(extraAllowedHosts({ ATLAS_CORE_ALLOWED_HOSTS: "" }), []);
  assert.deepEqual(extraAllowedHosts({ ATLAS_CORE_ALLOWED_HOSTS: "  " }), []);
  assert.deepEqual(extraAllowedHosts({ ATLAS_CORE_ALLOWED_HOSTS: "proxy.example" }), ["proxy.example"]);
  assert.deepEqual(extraAllowedHosts({ ATLAS_CORE_ALLOWED_HOSTS: "  a.example   b.example\tc.example  " }), [
    "a.example",
    "b.example",
    "c.example",
  ]);
  assert.deepEqual(extraAllowedHosts({ ATLAS_CORE_ALLOWED_HOSTS: "*" }), ["*"]);
});

test("linkHost prefers ATLAS_CORE_LINK_HOST, then falls back to the dial host", () => {
  assert.equal(linkHost({}), LOOPBACK_HOST);
  assert.equal(linkHost({ ATLAS_CORE_LINK_HOST: "host.example" }), "host.example");
  assert.equal(linkHost({ ATLAS_CORE_LINK_HOST: "  " }), LOOPBACK_HOST);
  // Non-wildcard bind with no explicit link host -> links reuse the bind address.
  assert.equal(linkHost({ ATLAS_CORE_HOST: "100.64.0.1" }), "100.64.0.1");
  // Wildcard bind with an explicit link host -> links use the hostname, not 0.0.0.0.
  assert.equal(linkHost({ ATLAS_CORE_HOST: "0.0.0.0", ATLAS_CORE_LINK_HOST: "host.example" }), "host.example");
  // IPv6 wildcard bind with no explicit link host -> links use the concrete loopback listener.
  assert.equal(linkHost({ ATLAS_CORE_HOST: "::" }), LOOPBACK_HOST);
});

test("hostForUrl brackets IPv6 literals but leaves IPv4 and hostnames alone", () => {
  assert.equal(hostForUrl("127.0.0.1"), "127.0.0.1");
  assert.equal(hostForUrl("host.example"), "host.example");
  assert.equal(hostForUrl("::1"), "[::1]");
  assert.equal(hostForUrl("[::1]"), "[::1]");
});
