const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("MyFirstContract", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MyFirstContract");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, alice, bob };
  }

  describe("deposit", function () {
    it("starts every account at a zero balance", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      expect(await contract.balances(owner.address)).to.equal(0n);
    });

    it("credits the caller's balance by the deposited amount", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      expect(await contract.balances(owner.address)).to.equal(100n);
    });

    it("accumulates across multiple deposits", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      await contract.connect(owner).deposit({ value: 25 });
      expect(await contract.balances(owner.address)).to.equal(125n);
    });

    it("keeps balances independent per address", async function () {
      const { contract, alice, bob } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 40 });
      await contract.connect(bob).deposit({ value: 15 });
      expect(await contract.balances(alice.address)).to.equal(40n);
      expect(await contract.balances(bob.address)).to.equal(15n);
    });

    it("increases the contract's own ETH balance by the deposited amount", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).deposit({ value: 100 })
      ).to.changeEtherBalance(contract, 100);
    });
  });

  describe("withdraw", function () {
    it("reduces the caller's balance by the withdrawn amount", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      await contract.connect(owner).withdraw(40);
      expect(await contract.balances(owner.address)).to.equal(60n);
    });

    it("sends the withdrawn ETH back to the caller", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      await expect(
        contract.connect(owner).withdraw(40)
      ).to.changeEtherBalances([contract, owner], [-40, 40]);
    });

    it("allows withdrawing the full balance down to zero", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      await contract.connect(owner).withdraw(100);
      expect(await contract.balances(owner.address)).to.equal(0n);
    });

    it("reverts with 'not enough balance' when withdrawing more than the balance", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 50 });
      await expect(
        contract.connect(owner).withdraw(51)
      ).to.be.revertedWith("not enough balance");
    });

    it("reverts when withdrawing from a zero balance", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).withdraw(1)
      ).to.be.revertedWith("not enough balance");
    });

    it("does not let one account withdraw against another account's deposit", async function () {
      const { contract, alice, bob } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 100 });
      await expect(
        contract.connect(bob).withdraw(1)
      ).to.be.revertedWith("not enough balance");
      expect(await contract.balances(alice.address)).to.equal(100n);
    });
  });

  describe("transfer", function () {
    it("moves balance from sender to recipient", async function () {
      const { contract, alice, bob } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 100 });
      await contract.connect(alice).transfer(bob.address, 40);
      expect(await contract.balances(alice.address)).to.equal(60n);
      expect(await contract.balances(bob.address)).to.equal(40n);
    });

    it("reverts with 'not enough balance' when transferring more than the balance", async function () {
      const { contract, alice, bob } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 50 });
      await expect(
        contract.connect(alice).transfer(bob.address, 51)
      ).to.be.revertedWith("not enough balance");
    });

    it("reverts when transferring to the zero address", async function () {
      const { contract, alice } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 50 });
      await expect(
        contract.connect(alice).transfer(ethers.ZeroAddress, 10)
      ).to.be.revertedWith("cannot transfer to zero address");
    });

    it("emits Transferred with the correct args", async function () {
      const { contract, alice, bob } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 100 });
      await expect(contract.connect(alice).transfer(bob.address, 40))
        .to.emit(contract, "Transferred")
        .withArgs(alice.address, bob.address, 40n);
    });

    it("does not affect the recipient's balance if the transfer reverts", async function () {
      const { contract, alice, bob } = await loadFixture(deployFixture);
      await contract.connect(alice).deposit({ value: 10 });
      await expect(
        contract.connect(alice).transfer(bob.address, 20)
      ).to.be.revertedWith("not enough balance");
      expect(await contract.balances(bob.address)).to.equal(0n);
    });
  });

  describe("events", function () {
    it("emits Deposited with the correct args", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(contract.connect(owner).deposit({ value: 100 }))
        .to.emit(contract, "Deposited")
        .withArgs(owner.address, 100n, 100n);
    });

    it("emits Deposited with the running balance, not just the amount", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      await expect(contract.connect(owner).deposit({ value: 25 }))
        .to.emit(contract, "Deposited")
        .withArgs(owner.address, 25n, 125n);
    });

    it("emits Withdrawn with the correct args", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).deposit({ value: 100 });
      await expect(contract.connect(owner).withdraw(40))
        .to.emit(contract, "Withdrawn")
        .withArgs(owner.address, 40n, 60n);
    });
  });
});
