
CLOSURE = java -jar  ./external/closure/closure-compiler-20111114.jar
CLOSURE_FLAGS= 

LICENSE=LICENSE
VERSION=0.1.0

BUILD_DIR=build

CORE=$(BUILD_DIR)/metaplayer.js
CSS=$(BUILD_DIR)/metaplayer.css

ALL_JS=$(BUILD_DIR)/metaplayer-complete.js
ALL_MIN=$(BUILD_DIR)/metaplayer-complete.min.js

CORE_SRC=src/core/metaplayer.js src/core/*/*js
CORE_MIN=$(CORE:.js=.min.js)

ALL_SERVICES=service.mrss service.ramp
ALL_PLAYERS=player.html5 player.flowplayer player.youtube player.ovp player.jwplayer
ALL_UI=ui.controls ui.overlay ui.transcript ui.captions ui.searchbox ui.videojs ui.endcap ui.social ui.embed ui.framefeed ui.headlines
ALL_THEME=theme.mp2

compile=$(CLOSURE) $(CLOSURE_FLAGS) --js=$1 >  $2
license=cat $(LICENSE) $1 > $1.tmp; mv $1.tmp $1

all: clean $(CORE) $(CSS) $(ALL_SERVICES) $(ALL_PLAYERS) $(ALL_UI) $(ALL_THEME) $(CORE_MIN) $(ALL_MIN)
	@@echo "Build complete. "

.PHONY : clean

test : 
	@echo $(BUILD_DIR) $(BUILD2_DIR)

$(CORE): $(BUILD_DIR)
	@@echo $@
	@cat $(CORE_SRC) > $@
	@cat $(CORE_SRC) > $(ALL_JS)

$(CSS): $(BUILD_DIR) $(ALL_UI)
	@cat src/core/*/*.css >> $(CSS)
	@echo $@ 

service.%: $(BUILD_DIR)
	@echo $@ 
	@cat src/services/$*/*js >> $(CORE)
	@cat src/services/$*/*js >> $(ALL_JS)

player.%: $(BUILD_DIR)
	@echo $@ 
	@cat src/players/$*/*js >> $(CORE)
	@cat src/players/$*/*js >> $(ALL_JS)

ui.%: $(BUILD_DIR)
	@echo $@ 
	@cat src/ui/$*/*js >> $(BUILD_DIR)/metaplayer.$*.js
	@cat src/ui/$*/*js >> $(ALL_JS)
	@$(call license,$(BUILD_DIR)/metaplayer.$*.js)
	@cat src/ui/$*/*css >> $(CSS)
	@if test -d src/ui/$*/templates; then cp src/ui/$*/templates/*\.tmpl\.* $(BUILD_DIR)/templates; fi

theme.%: $(CSS)
	@echo $@ 
	@mkdir $(BUILD_DIR)/$*
	@cat $(CSS) > $(BUILD_DIR)/$*/theme.$*.css
	@cat src/themes/$*/*css >> $(BUILD_DIR)/$*/theme.$*.css 2>/dev/null
	@cp -r src/themes/$*/assets $(BUILD_DIR)/$*/ 2>/dev/null

%.min.js: %.js
	@echo $@ 
	@$(call compile,$<,$@)
	@$(call license,$@)

$(BUILD_DIR):
	@echo $@/
	@mkdir  $@
	@mkdir  $@/templates

clean: 
	@echo "Cleaning up previous builds..."
	@rm -rf $(BUILD_DIR);

