/*
	PluginManager

	An abstract class used to require an array of external modules
	or `plugins` specified by an array of module names. Each plugin
	is safely loaded, configured and initialized by this class before 
	being used externally.

	Plugin Lifecycle
	1. Require plugin module
	2. Call `check()` method
	3. Call `init()` method
	4. Plugin now safely running
*/

function PluginManager() {

	/*
		Performs all setup necessary to begin running a list of plugins.
		Includes loading, configuring and initialization.

		@param plugins - An array of plugin names corresponding to file
		names in the plugins directory.

		@return -  An array of loaded, configured, initialized plugin
		modules or functions.
	*/
	PluginManager.prototype.runPlugins = function(plugins) {
		var loadedPlugins = PluginManager.prototype.loadPlugins(plugins);
		console.log(loadedPlugins.length + " Plugins loaded");

		var runningPlugins = PluginManager.prototype.initializePlugins(loadedPlugins);
		console.log(runningPlugins.length + " Plugins initialized");

		this.runningPlugins = runningPlugins;
		return runningPlugins;
	}

	/*
		Loads a list of plugins by requiring the necessary module
		and checking that it is configured correctly.

		@param plugins - An array of plugin names corresponding to file
		names in the plugins directory.

		@return -  An array of loaded, configured plugin modules or functions.
	*/
	PluginManager.prototype.loadPlugins = function(plugins) {
		var loadedPlugins = [];
		var loadedPluginNames = [];

		for (var idx in plugins) {
			var plugin = plugins[idx];
			var module = PluginManager.prototype.loadPlugin(plugin);

			if (module != null && PluginManager.prototype.validatePlugin(module)) {
				loadedPlugins.push(module);
				loadedPluginNames.push(plugin);
			}
			else {
				console.log(plugin + " configuration failed. Plugin not activated");
			}
		}

		this.loadedPluginNames = loadedPluginNames;
		return loadedPlugins;
	}

	/*
		Initializes plugins that have already been loaded by calling
		their internal `init` method.

		@param plugins - An array of plugin modules or functons that have been
		required and configured.

		@return -  An array of loaded, configured and initialized plugin 
		modules or functions.
	*/
	PluginManager.prototype.initializePlugins = function(plugins) {
		var intializedPlugins = [];

		for (var idx in plugins) {
			var plugin = plugins[idx];
			plugin.init();
			intializedPlugins.push(plugin);
		}

		return intializedPlugins;
	}
	
	/*
		Loads an individual plugin by requiring the necessary module.

		@param plugins - An array of plugin names corresponding to file
		names in the plugins directory.

		@return -  An array of loaded, configured plugin modules or functions.
	*/
	PluginManager.prototype.loadPlugin = function(plugin) {
		try {
			var module = require('./plugins/' + plugin);
			return new module();
		}
		catch(err) {
			console.log("Error: Module path not found");
			return null;
		}
	}

	/*
		Validates an individual plugin by checking that all configuration
		requirements have been met. A plugin is considering configured correctly
		if its internal `check` method returns true, or if no such method exists.

		@param plugins - A plugin module or function.

		@return -  `true` if no configuration is needed, or if internal plugin 
		configuration returns `true`. Otherwise returns `false` and is ignored.
	*/
	PluginManager.prototype.validatePlugin = function(plugin) {
		if (typeof plugin.check == 'function') {
			if (plugin.check()) {
				return true;
			}
			else {
				return false;
			}
		}
		return true;
	}

	/*
		Forwards a given `Message` object to each internal running plugin's
		`doMessage` method.

		@param - message - A message object from the Telegram API.
		@param - callback - A function which handles a response from a plugin.
	*/
	PluginManager.prototype.doMessage = function(message, callback) {
		var runningPlugins = this.runningPlugins;
		for (var idx in runningPlugins) {
			var runningPlugin = runningPlugins[idx];
			runningPlugin.doMessage(message, callback);
		}
	}
}

module.exports = PluginManager;
