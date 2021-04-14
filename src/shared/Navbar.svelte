<script>
  import { link } from 'svelte-routing';
</script>

<nav>
    <li class="menu-item">
        <a href='/calculator' use:link>
            Räknare
        </a>
    </li>
    <li class="menu-item">
        <a href='/log' use:link>
            Logg
        </a>
    </li>
</nav>

<style>
    nav {
        background-color: white;
        height: 65px;
        text-transform: uppercase;
        border-bottom: 2px solid;
        display: flex;
    }

    .menu-item {
        width: 50%;
        display: flex;
        place-items: center;
        justify-content: center;
    }

    .menu-item a {
        color: black;
        opacity: 1;
        transition: opacity .5s ease-out;
        -moz-transition: opacity .5s ease-out;
        -webkit-transition: opacity .5s ease-out;
        -o-transition: opacity .5s ease-out;
        font-size: 28px;
    }

    .menu-item a:hover {
        text-decoration: none;
        opacity: .5;
    }
</style>