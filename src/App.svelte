<script>
	import { Router, Route } from "svelte-routing";
    import Calculator from "./pages/Calculator.svelte";
    import Log from "./pages/Log.svelte";
	import Navbar from "./shared/Navbar.svelte";
    export let url = '';
</script>

<Router url="{url}">
	<Navbar />
	<div>
		<Route path="calculator" component="{ Calculator }" />
		<Route path="log" component="{ Log }" />
		<Route path="/"><Calculator /></Route>
	</div>
</Router>

<style>
</style>