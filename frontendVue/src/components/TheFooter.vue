<template>
  <footer class="footer">
    <div class="footer__logo">
      <img src="/img/logo-green.png" alt="Natour logo" />
    </div>
    <ul class="footer__nav">
      <li><a href="#">About us</a></li>
      <li><a href="#">Download apps</a></li>
      <li><a href="#">Become a guide</a></li>
      <li><a href="#">Careers</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background-color: #f7f7f7;
  padding: 6rem 4rem 3rem 4rem;
  font-size: 1.4rem;
  display: grid;
  grid-template-columns: auto auto;
  grid-row-gap: 0.75rem;
  justify-content: space-between;

  @media only screen and (max-width: 50em) {
    grid-template-columns: 1fr;
    grid-row-gap: 1.25rem;
    justify-items: center;
  }

  &__logo {
    grid-row: 1 / 3;
    align-self: center;

    @media only screen and (max-width: 50em) {
      grid-row: 1;
    }

    img {
      height: 3rem;
    }
  }

  &__nav {
    list-style: none;
    display: flex;
    justify-content: flex-end;

    li {
      margin-left: 1.5rem;
      text-align: center;
    }

    a {
      color: #777;
      text-decoration: none !important;
      transition: all 0.2s;

      &:hover,
      &:active {
        color: #55c57a;
      }
    }
  }

  &__copyright {
    justify-self: end;
    color: #999;

    @media only screen and (max-width: 50em) {
      justify-self: center;
    }
  }
}
</style>