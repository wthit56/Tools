var Pool = (function() {
	function Pool(create, clean, target_cache_size = 1) {
		this.cache = new Array(); this.clean_index = 0;
		this._create = create;
		this._clean = clean;
		this.target_cache_size = target_cache_size;
	}
	Pool.prototype = {
		
		get: function() {
			var fresh;
			if (this.clean_index >= this.cache.length) {
				fresh = this._create();
				fresh.pool_index = this.clean_index;
				fresh.pool = this;
				fresh.pool_fresh = false;
				fresh.release = instance_release;
				this.cache[this.clean_index] = fresh;
			}
			else {
				fresh = this.cache[this.clean_index];
			}
			
			this.clean_index++;
			fresh.pool_fresh = false;

			return fresh;
		},
		release: function(instance) {
			// clean instance
			this._clean(instance);
			instance.pool_fresh = true;

			// instance is before clean_index in cache

			// move whatever was in clean_index-1 to instance's old spot
			var swapped_out = this.cache[this.clean_index-1]
			this.cache[instance.pool_index] = swapped_out;
			swapped_out.pool_index = instance.pool_index;
			
			// move instance into clean_index-1 spot
			this.cache[this.clean_index-1] = instance;
			instance.pool_index = this.clean_index-1;
			
			// clean_index--;
			this.clean_index--;
			
			// FAILSAFE should never happen
			if (this.clean_index < 0) { throw "RELEASING FROM POOL; clean_index was 0, when an instance "; }

			if (this.clean_index <= this.target_cache_size && this.cache.length > this.target_cache_size) {
				this.cache.length = this.target_cache_size;
			}
		}
	}

	function instance_release() {
		if (!this.pool_fresh) { this.pool.release(this); }
	}


	var p = new Pool(
		function create() { return [] },
		function clean(d) { d.length = 0; }
	);
	var a = p.get(); a.name="a"; a.push(1,2,3);
	var b = p.get(); b.name="b"; b.push(4,5,6);
	a.release();
	console.log(a,b, p);
	b.release();
	console.log(a,b, p);
	console.log(p.get());
	
	return Pool;
})();